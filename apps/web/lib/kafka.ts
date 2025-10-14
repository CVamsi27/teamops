import { Kafka } from "@upstash/kafka";

export interface NotificationEvent {
  type:
    | "task_assigned"
    | "task_completed"
    | "project_created"
    | "team_invite"
    | "deadline_reminder";
  userId: number;
  data: unknown;
  timestamp: Date;
  id: string;
}

export class KafkaService {
  private static instance: KafkaService;
  private kafka: Kafka | null = null;

  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  constructor() {
    this.initializeKafka();
  }

  private initializeKafka() {
    try {
      const url = process.env.UPSTASH_KAFKA_REST_URL;
      const username = process.env.UPSTASH_KAFKA_REST_USERNAME;
      const password = process.env.UPSTASH_KAFKA_REST_PASSWORD;

      if (url && username && password) {
        this.kafka = new Kafka({
          url,
          username,
          password,
        });
      } else {
        this.kafka = null;
      }
    } catch (error) {
      console.error("Kafka initialization error:", error);
    }
  }

  async publishNotification(notification: NotificationEvent): Promise<boolean> {
    try {
      if (!this.kafka) {
        return false;
      }

      const producer = this.kafka.producer();
      await producer.produce(
        "notifications",
        JSON.stringify(notification),
        {
          key: notification.userId.toString(),
          headers: [
            { key: "content-type", value: "application/json" },
            { key: "event-type", value: notification.type },
          ],
        },
      );

      return true;
    } catch (error) {
      console.error("Failed to publish notification:", error);
      return false;
    }
  }

  async publishTaskEvent(event: {
    type: "created" | "updated" | "deleted" | "assigned" | "completed";
    taskId: number;
    userId: number;
    projectId?: number;
    data: unknown;
  }): Promise<boolean> {
    try {
      if (!this.kafka) {
        return false;
      }

      const eventData = {
        ...event,
        timestamp: new Date().toISOString(),
        id: `task_${event.taskId}_${Date.now()}`,
      };

      const producer = this.kafka.producer();
      await producer.produce(
        "task-events",
        JSON.stringify(eventData),
        {
          key: event.taskId.toString(),
          headers: [
            { key: "content-type", value: "application/json" },
            { key: "event-type", value: event.type },
            { key: "user-id", value: event.userId.toString() },
          ],
        },
      );

      return true;
    } catch (error) {
      console.error("Failed to publish task event:", error);
      return false;
    }
  }

  async publishProjectEvent(event: {
    type: "created" | "updated" | "deleted" | "member_added" | "member_removed";
    projectId: number;
    userId: number;
    teamId?: number;
    data: unknown;
  }): Promise<boolean> {
    try {
      if (!this.kafka) {
        return false;
      }

      const eventData = {
        ...event,
        timestamp: new Date().toISOString(),
        id: `project_${event.projectId}_${Date.now()}`,
      };

      const producer = this.kafka.producer();
      await producer.produce(
        "project-events",
        JSON.stringify(eventData),
        {
          key: event.projectId.toString(),
          headers: [
            { key: "content-type", value: "application/json" },
            { key: "event-type", value: event.type },
            { key: "user-id", value: event.userId.toString() },
          ],
        },
      );

      return true;
    } catch (error) {
      console.error("Failed to publish project event:", error);
      return false;
    }
  }

  async consumeNotifications(
    callback: (notification: NotificationEvent) => void,
  ): Promise<void> {
    try {
      if (!this.kafka) {
        console.warn("Kafka not configured, cannot consume notifications");
        return;
      }

      const consumer = this.kafka.consumer();

      try {
        const messages = await consumer.consume({
          consumerGroupId: "teamops-notifications",
          instanceId: `instance-${Date.now()}`,
          topics: ["notifications"],
          autoOffsetReset: "earliest",
        });

        if (messages && Array.isArray(messages) && messages.length > 0) {
          messages.forEach((message: unknown) => {
            try {
              const m = message as { value?: string | Buffer | null };
              const valueStr = m.value ? m.value.toString() : '';
              const notification: NotificationEvent = JSON.parse(valueStr);
              callback(notification);
            } catch (parseError: unknown) {
              const msg = parseError && typeof parseError === 'object' && 'message' in parseError
                ? (parseError as { message?: unknown }).message
                : String(parseError);
              console.error("Failed to parse notification message:", msg);
            }
          });
        }
      } catch {
        console.warn(
          "Kafka consumer not fully implemented in Upstash REST API, consider using webhooks",
        );
      }
    } catch (error) {
      console.error("Failed to consume notifications:", error);
    }
  }

  createNotificationEvent(
    type: NotificationEvent["type"],
    userId: number,
    data: unknown,
  ): NotificationEvent {
    return {
      type,
      userId,
      data,
      timestamp: new Date(),
      id: `notification_${userId}_${Date.now()}`,
    };
  }

  async publishBatch(
    events: Array<{
      topic: string;
      key: string;
      value: unknown;
      headers?: Array<{ key: string; value: string }>;
    }>,
  ): Promise<boolean> {
    try {
      if (!this.kafka) {
        console.warn("Kafka not configured, skipping batch publish");
        return false;
      }

      const producer = this.kafka.producer();

      const results = await Promise.allSettled(
        events.map((event) =>
          producer.produce(
            event.topic,
            typeof event.value === "string"
              ? event.value
              : JSON.stringify(event.value),
            {
              key: event.key,
              headers: event.headers || [],
            },
          ),
        ),
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      console.log(
        `Batch publish: ${successful}/${events.length} messages sent`,
      );

      return successful === events.length;
    } catch (error) {
      console.error("Failed to publish batch:", error);
      return false;
    }
  }
}

export const kafka = KafkaService.getInstance();

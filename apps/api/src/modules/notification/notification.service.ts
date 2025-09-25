import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private logger = new Logger(NotificationService.name);
  private topics = ['task.created', 'task.updated'];
  private kafkaEnabled = false;

  constructor(private gateway: NotificationGateway) {
    if (process.env.KAFKA_ENABLED === 'true') {
      this.initializeKafka();
    } else {
      this.logger.log(
        'Kafka is disabled. Set KAFKA_ENABLED=true to enable Kafka integration.'
      );
    }
  }

  private initializeKafka() {
    try {
      const brokers = process.env.KAFKA_BROKERS.split(',');
      this.kafka = new Kafka({
        clientId: 'teamops-notify',
        brokers,
        logLevel: process.env.APP_ENV === 'production' ? 2 : 1,
      });
      this.consumer = this.kafka.consumer({ groupId: 'teamops-notify-group' });
      this.kafkaEnabled = true;
    } catch (e: any) {
      this.logger.warn('Kafka initialization failed: ' + (e?.message ?? e));
      this.kafkaEnabled = false;
    }
  }

  async onModuleInit() {
    if (!this.kafkaEnabled || !this.consumer) {
      this.logger.log('Kafka consumer not initialized, skipping startup');
      return;
    }

    try {
      await this.consumer.connect();
      for (const t of this.topics) {
        await this.consumer.subscribe({ topic: t, fromBeginning: false });
      }

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const value = message.value?.toString();
            const payload = value ? JSON.parse(value) : null;
            this.logger.log(`Consumed message from topic: ${topic}`);
            this.gateway.broadcast(topic, payload);
          } catch (parseError: any) {
            this.logger.warn(
              `Failed to parse message from topic ${topic}: ${parseError.message}`
            );
          }
        },
      });

      this.logger.log('Kafka consumer started successfully');
    } catch (err: any) {
      this.logger.warn('Kafka consumer start failed: ' + (err?.message ?? err));
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      try {
        await this.consumer.disconnect();
        this.logger.log('Kafka consumer disconnected');
      } catch (e: any) {
        this.logger.warn(
          'Error disconnecting Kafka consumer: ' + (e?.message ?? e)
        );
      }
    }
  }
}

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { NotificationGateway } from './notification.gateway';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import type { CreateNotification } from '@workspace/api';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private consumer: Consumer | null = null;
  private logger = new Logger(NotificationService.name);
  private topics = ['task.created', 'task.updated'];
  private kafkaEnabled = false;

  constructor(
    private gateway: NotificationGateway,
    private notificationRepository: NotificationRepository
  ) {
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
      if (!process.env.KAFKA_BROKERS) {
        this.logger.warn(
          'KAFKA_BROKERS not configured. Traditional Kafka setup skipped.'
        );
        this.kafkaEnabled = false;
        return;
      }

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

  async create(createNotificationDto: CreateNotificationDto) {
    const createData: CreateNotification = {
      userId: createNotificationDto.userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type,
      data: createNotificationDto.metadata,
      read: false,
    };

  const _notification = await this.notificationRepository.create(createData);

  this.gateway.broadcast('notification', _notification);

  return _notification;
  }

  async createFromApi(createData: CreateNotification) {
  const _notification = await this.notificationRepository.create(createData);

  this.gateway.broadcast('notification', _notification);

  return _notification;
  }

  async findAllForUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    return this.notificationRepository.findManyForUser(
      userId,
      page,
      limit,
      unreadOnly
    );
  }

  async findOne(id: string, userId: string) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId: string
  ) {
    await this.findOne(id, userId);
    const updateData = {
      ...(updateNotificationDto.title && {
        title: updateNotificationDto.title,
      }),
      ...(updateNotificationDto.message && {
        message: updateNotificationDto.message,
      }),
      ...(updateNotificationDto.type && { type: updateNotificationDto.type }),
      ...(updateNotificationDto.metadata && {
        data: updateNotificationDto.metadata,
      }),
      ...(updateNotificationDto.isRead !== undefined && {
        read: updateNotificationDto.isRead,
      }),
    };
    return this.notificationRepository.update(id, updateData);
  }

  async markAsRead(id: string, userId: string) {
  await this.findOne(id, userId);
  return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.getUnreadCount(userId);
    return { count };
  }

  async delete(id: string, userId: string) {
  await this.findOne(id, userId);
  return this.notificationRepository.delete(id);
  }
}

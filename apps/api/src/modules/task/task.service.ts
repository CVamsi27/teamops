import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { ActivityService } from '../activity/activity.service';
import { Kafka, Producer, Partitioners } from 'kafkajs';
import type {
  CreateTaskWithCreator,
  UpdateTask,
  Task,
  TaskCreatedEvent,
  TaskUpdatedEvent,
} from '@workspace/api';

@Injectable()
export class TaskService implements OnModuleDestroy {
  private kafkaProducer: Producer | null = null;
  private kafka: Kafka | null = null;
  private logger = new Logger(TaskService.name);
  private kafkaEnabled = false;

  constructor(
    private repo: TaskRepository,
    private activityService: ActivityService
  ) {
    if (process.env.KAFKA_ENABLED === 'true') {
      this.initializeKafka();
    } else {
      this.logger.log(
        'Kafka is disabled. Set KAFKA_ENABLED=true to enable Kafka integration.'
      );
    }
  }

  private async initializeKafka() {
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
        clientId: 'teamops-task-producer',
        brokers,
        logLevel: process.env.APP_ENV === 'production' ? 2 : 1,
      });

      this.kafkaProducer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
      });

      await this.kafkaProducer.connect();
      this.kafkaEnabled = true;
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      const err = error as Error;
      this.logger.warn('Kafka producer connect failed: ' + (err?.message ?? String(error)));
      this.kafkaProducer = null;
      this.kafkaEnabled = false;
    }
  }

  async list(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async getMyTasks(userId: string): Promise<Task[]> {
    return this.repo.findByAssigneeId(userId);
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.repo.findByProjectId(projectId);
  }

  async get(id: string): Promise<Task> {
    const t = await this.repo.findOne(id);
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async create(dto: CreateTaskWithCreator): Promise<Task> {
    const t = await this.repo.create(dto);

    const userInfo = await this.repo['prisma'].user.findUnique({
      where: { id: dto.createdById },
      select: { name: true, email: true },
    });

    const userName = userInfo?.name || userInfo?.email || 'Unknown User';
    const userEmail = userInfo?.email || 'unknown@example.com';

    try {
      await this.activityService.trackTaskActivity(
        'task_created',
        t.id,
        t.title,
        dto.createdById,
        userName,
        userEmail
      );
    } catch (error) {
      this.logger.warn('Failed to track activity:', error);
    }

    const event: TaskCreatedEvent = {
      id: t.id,
      title: t.title,
      projectId: t.projectId,
      status: t.status,
      createdAt: t.createdAt!,
    };
    await this.publishTaskEvent('task.created', event);
    return t;
  }

  async update(
    id: string,
    dto: UpdateTask,
    user: { userId: string; email: string }
  ): Promise<Task> {
    const oldTask = await this.repo.findOne(id);
    if (!oldTask) throw new NotFoundException('Task not found');

    const t = await this.repo.update(id, dto);
    if (!t) throw new NotFoundException('Task not found');

    const userInfo = await this.repo['prisma'].user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true },
    });

    const userName = userInfo?.name || userInfo?.email || 'Unknown User';

    let activityType: 'task_updated' | 'task_completed' = 'task_updated';
    if (dto.status === 'DONE' && oldTask.status !== 'DONE') {
      activityType = 'task_completed';
    }

    const metadata: Record<string, unknown> = {};
    if (dto.status && dto.status !== oldTask.status) {
      metadata.oldStatus = oldTask.status;
      metadata.newStatus = dto.status;
    }
    if (dto.priority && dto.priority !== oldTask.priority) {
      metadata.oldPriority = oldTask.priority;
      metadata.newPriority = dto.priority;
    }
    if (dto.dueDate !== oldTask.dueDate) {
      metadata.oldDueDate = oldTask.dueDate;
      metadata.newDueDate = dto.dueDate;

      if (dto.dueDate !== oldTask.dueDate) {
        try {
          await this.activityService.trackTaskActivity(
            'due_date_changed',
            t.id,
            t.title,
            user.userId,
            userName,
            user.email,
            { oldDueDate: oldTask.dueDate, newDueDate: dto.dueDate }
          );
        } catch (error) {
          this.logger.warn('Failed to track due date activity:', error);
        }
      }
    }

    try {
      await this.activityService.trackTaskActivity(
        activityType,
        t.id,
        t.title,
        user.userId,
        userName,
        user.email,
        Object.keys(metadata).length > 0 ? metadata : undefined
      );
    } catch (error) {
      this.logger.warn('Failed to track activity:', error);
    }

    const event: TaskUpdatedEvent = {
      id: t.id,
      status: t.status,
      priority: t.priority,
      updatedAt: t.updatedAt!,
    };
    await this.publishTaskEvent('task.updated', event);
    return t;
  }

  async remove(
    id: string,
    user: { userId: string; email: string }
  ): Promise<void> {
    const task = await this.repo.findOne(id);
    if (!task) throw new NotFoundException('Task not found');

    const userInfo = await this.repo['prisma'].user.findUnique({
      where: { id: user.userId },
      select: { name: true, email: true },
    });

    const userName = userInfo?.name || userInfo?.email || 'Unknown User';

    try {
      await this.activityService.trackTaskActivity(
        'task_deleted',
        task.id,
        task.title,
        user.userId,
        userName,
        user.email
      );
    } catch (error) {
      this.logger.warn('Failed to track activity:', error);
    }

    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Task not found');
  }

  private async publishTaskEvent(
    topic: string,
    payload: TaskCreatedEvent | TaskUpdatedEvent
  ) {
    try {
      if (!this.kafkaEnabled || !this.kafkaProducer) {
        this.logger.debug(
          `Kafka not available, skipping event publication for topic: ${topic}`
        );
        return;
      }
      await this.kafkaProducer.send({
        topic,
        messages: [
          {
            key: payload.id,
            value: JSON.stringify(payload),
          },
        ],
      });
      this.logger.debug(`Published event to topic: ${topic}`);
    } catch (error) {
      const err = error as Error;
      this.logger.warn('Failed to publish event: ' + (err?.message ?? String(error)));
    }
  }

  async onModuleDestroy() {
    try {
      if (this.kafkaProducer) await this.kafkaProducer.disconnect();
    } catch (error) {
      this.logger.warn('Error disconnecting Kafka producer:', error);
    }
  }
}

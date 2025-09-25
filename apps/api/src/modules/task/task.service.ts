import {
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Kafka, Producer, Partitioners } from 'kafkajs';
import type {
  CreateTask,
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

  constructor(private repo: TaskRepository) {
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
    } catch (e: any) {
      this.logger.warn('Kafka producer connect failed: ' + (e?.message ?? e));
      this.kafkaProducer = null;
      this.kafkaEnabled = false;
    }
  }

  async list(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Task> {
    const t = await this.repo.findOne(id);
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async create(dto: CreateTask): Promise<Task> {
    const t = await this.repo.create(dto);
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

  async update(id: string, dto: UpdateTask): Promise<Task> {
    const t = await this.repo.update(id, dto);
    if (!t) throw new NotFoundException('Task not found');
    const event: TaskUpdatedEvent = {
      id: t.id,
      status: t.status,
      priority: t.priority,
      updatedAt: t.updatedAt!,
    };
    await this.publishTaskEvent('task.updated', event);
    return t;
  }

  async remove(id: string): Promise<void> {
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
    } catch (e: any) {
      this.logger.warn('Failed to publish event: ' + (e?.message ?? e));
    }
  }

  async onModuleDestroy() {
    try {
      if (this.kafkaProducer) await this.kafkaProducer.disconnect();
    } catch {}
  }
}

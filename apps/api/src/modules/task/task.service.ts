import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { ProjectMembershipRepository } from '../project/project-membership.repository';
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
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private membershipRepo: ProjectMembershipRepository
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

  private async checkReassignmentPermission(
    userId: string,
    projectId: string
  ): Promise<void> {
    if (!projectId) {
      // Task without project can be reassigned by anyone who can update it
      return;
    }

    const membership = await this.membershipRepo.findByUserAndProject(
      userId,
      projectId
    );

    if (
      !membership ||
      (membership.role !== 'LEAD' && membership.role !== 'CONTRIBUTOR')
    ) {
      throw new ForbiddenException(
        'Only LEAD and CONTRIBUTOR members can reassign tasks'
      );
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

  async getWorkloadDistribution(projectId: string): Promise<
    Array<{
      userId: string;
      name: string | null;
      email: string;
      totalTasks: number;
      todoCount: number;
      inProgressCount: number;
      doneCount: number;
    }>
  > {
    // Get all tasks for the project
    const tasks = await this.repo.findByProjectId(projectId);

    // Get all project members
    const members = await this.membershipRepo.findAllByProjectIdWithUser(
      projectId
    );

    // Build workload distribution map
    const workloadMap = new Map<
      string,
      {
        userId: string;
        name: string | null;
        email: string;
        totalTasks: number;
        todoCount: number;
        inProgressCount: number;
        doneCount: number;
      }
    >();

    // Initialize all members with zero tasks
    members.forEach((member) => {
      if (member.user) {
        workloadMap.set(member.userId, {
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
          totalTasks: 0,
          todoCount: 0,
          inProgressCount: 0,
          doneCount: 0,
        });
      }
    });

    // Count tasks by assignee and status
    tasks.forEach((task) => {
      if (task.assigneeId && workloadMap.has(task.assigneeId)) {
        const workload = workloadMap.get(task.assigneeId)!;
        workload.totalTasks += 1;

        if (task.status === 'TODO') {
          workload.todoCount += 1;
        } else if (task.status === 'IN_PROGRESS') {
          workload.inProgressCount += 1;
        } else if (task.status === 'DONE') {
          workload.doneCount += 1;
        }
      }
    });

    return Array.from(workloadMap.values());
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

    // Send notification to assignee (usually the creator by default)
    if (t.assigneeId) {
      try {
        const assigneeInfo = await this.repo['prisma'].user.findUnique({
          where: { id: t.assigneeId },
          select: { name: true, email: true },
        });

        const assigneeName = assigneeInfo?.name || assigneeInfo?.email || 'Unknown';

        // Only notify if assignee is different from creator
        if (t.assigneeId !== dto.createdById) {
          await this.notificationService.createFromApi({
            userId: t.assigneeId,
            title: `New Task: ${t.title}`,
            message: `${userName} created and assigned "${t.title}" to ${assigneeName}`,
            type: 'task_assigned',
            data: {
              taskId: t.id,
              taskTitle: t.title,
              createdBy: dto.createdById,
              createdByName: userName,
            },
            read: false,
          });
        }
      } catch (error) {
        this.logger.warn('Failed to create task assignment notification:', error);
      }
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

    // Check permission to reassign task if assigneeId is being changed
    if (dto.assigneeId !== undefined && dto.assigneeId !== oldTask.assigneeId) {
      await this.checkReassignmentPermission(user.userId, oldTask.projectId!);
    }

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

    // Handle assignee change notifications
    if (dto.assigneeId !== undefined && dto.assigneeId !== oldTask.assigneeId) {
      try {
        // Notify new assignee (if exists)
        if (dto.assigneeId) {
          await this.notificationService.createFromApi({
            userId: dto.assigneeId,
            title: `Task Assigned: ${t.title}`,
            message: `${userName} assigned "${t.title}" to you`,
            type: 'task_assigned',
            data: {
              taskId: t.id,
              taskTitle: t.title,
              assignedBy: user.userId,
              assignedByName: userName,
            },
            read: false,
          });
        }

        // Notify old assignee (if exists, unless they're the one making the change)
        if (oldTask.assigneeId && oldTask.assigneeId !== user.userId) {
          await this.notificationService.createFromApi({
            userId: oldTask.assigneeId,
            title: `Task Unassigned: ${t.title}`,
            message: `${userName} unassigned "${t.title}" from you`,
            type: 'task_unassigned',
            data: {
              taskId: t.id,
              taskTitle: t.title,
              unassignedBy: user.userId,
              unassignedByName: userName,
            },
            read: false,
          });
        }

        metadata.oldAssigneeId = oldTask.assigneeId;
        metadata.newAssigneeId = dto.assigneeId;
      } catch (error) {
        this.logger.warn('Failed to create assignee notification:', error);
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

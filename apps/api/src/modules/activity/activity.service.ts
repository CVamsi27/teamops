import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { ActivityType } from '@prisma/client';
import type { ActivityEvent } from '@workspace/api';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  private mapActivityType(type: ActivityType): ActivityEvent['type'] {
    const typeMap: Record<ActivityType, ActivityEvent['type']> = {
      TASK_CREATED: 'task_created',
      TASK_UPDATED: 'task_updated',
      TASK_COMPLETED: 'task_completed',
      TASK_DELETED: 'task_deleted',
      PROJECT_CREATED: 'project_created',
      PROJECT_UPDATED: 'project_updated',
      PROJECT_DELETED: 'project_deleted',
      TEAM_CREATED: 'team_created',
      TEAM_UPDATED: 'team_updated',
      MEMBER_ADDED: 'member_added',
      MEMBER_REMOVED: 'member_removed',
      COMMENT_ADDED: 'comment_added',
      DUE_DATE_CHANGED: 'due_date_changed',
    };
    return typeMap[type] || 'task_updated';
  }

  async getActivities(limit = 50): Promise<ActivityEvent[]> {
    const activities = await this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      type: this.mapActivityType(activity.type),
      userId: activity.userId,
      userName: activity.userName,
      userEmail: activity.userEmail,
      entityId: activity.entityId,
      entityName: activity.entityName,
      entityType: activity.entityType as 'task' | 'project' | 'team',
      metadata: activity.metadata as Record<string, unknown> | undefined,
      timestamp: activity.createdAt.toISOString(),
    }));
  }

  async getActivitiesByEntity(entityType: string, entityId: string): Promise<ActivityEvent[]> {
    const activities = await this.prisma.activity.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities.map((activity) => ({
      id: activity.id,
      type: this.mapActivityType(activity.type),
      userId: activity.userId,
      userName: activity.userName,
      userEmail: activity.userEmail,
      entityId: activity.entityId,
      entityName: activity.entityName,
      entityType: activity.entityType as 'task' | 'project' | 'team',
      metadata: activity.metadata as Record<string, unknown> | undefined,
      timestamp: activity.createdAt.toISOString(),
    }));
  }

  async createActivity(data: {
    type: string;
    userId: string;
    userName: string;
    userEmail: string;
    entityId: string;
    entityName: string;
    entityType: string;
    metadata?: Record<string, unknown>;
  }): Promise<ActivityEvent> {
    const activityType = data.type.toUpperCase() as ActivityType;
    
    const activity = await this.prisma.activity.create({
      data: {
        type: activityType,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        entityId: data.entityId,
        entityName: data.entityName,
        entityType: data.entityType,
        metadata: data.metadata as any || {},
      },
    });

    return {
      id: activity.id,
      type: this.mapActivityType(activity.type),
      userId: activity.userId,
      userName: activity.userName,
      userEmail: activity.userEmail,
      entityId: activity.entityId,
      entityName: activity.entityName,
      entityType: activity.entityType as 'task' | 'project' | 'team',
      metadata: activity.metadata as Record<string, unknown> | undefined,
      timestamp: activity.createdAt.toISOString(),
    };
  }

  // Helper method to track task activities
  async trackTaskActivity(
    type: 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted' | 'due_date_changed',
    taskId: string,
    taskTitle: string,
    userId: string,
    userName: string,
    userEmail: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.createActivity({
      type,
      userId,
      userName,
      userEmail,
      entityId: taskId,
      entityName: taskTitle,
      entityType: 'task',
      metadata,
    });
  }

  // Helper method to track project activities
  async trackProjectActivity(
    type: 'project_created' | 'project_updated' | 'project_deleted',
    projectId: string,
    projectName: string,
    userId: string,
    userName: string,
    userEmail: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.createActivity({
      type,
      userId,
      userName,
      userEmail,
      entityId: projectId,
      entityName: projectName,
      entityType: 'project',
      metadata,
    });
  }

  // Helper method to track team activities
  async trackTeamActivity(
    type: 'team_created' | 'team_updated' | 'member_added' | 'member_removed',
    teamId: string,
    teamName: string,
    userId: string,
    userName: string,
    userEmail: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.createActivity({
      type,
      userId,
      userName,
      userEmail,
      entityId: teamId,
      entityName: teamName,
      entityType: 'team',
      metadata,
    });
  }
}
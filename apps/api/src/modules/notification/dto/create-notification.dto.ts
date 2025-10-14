import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  TEAM_INVITATION = 'TEAM_INVITATION',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

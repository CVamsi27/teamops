import { z } from 'zod';
import { ID, ISODateString, TaskStatus, TaskPriority } from './common';

export const TaskCreatedEventSchema = z.object({
  id: ID,
  title: z.string(),
  projectId: ID,
  status: TaskStatus,
  createdAt: ISODateString,
});

export const TaskUpdatedEventSchema = z.object({
  id: ID,
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  updatedAt: ISODateString,
});

export const ActivityEventSchema = z.object({
  id: ID,
  type: z.enum([
    'task_created',
    'task_updated',
    'task_completed',
    'task_deleted',
    'task_assigned',
    'task_unassigned',
    'project_created',
    'project_updated',
    'project_deleted',
    'team_created',
    'team_updated',
    'member_added',
    'member_removed',
    'comment_added',
    'due_date_changed',
  ]),
  userId: ID,
  userName: z.string(),
  userEmail: z.string(),
  entityId: ID,
  entityName: z.string(),
  entityType: z.enum(['task', 'project', 'team']),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: ISODateString,
});

export type TaskCreatedEvent = z.infer<typeof TaskCreatedEventSchema>;
export type TaskUpdatedEvent = z.infer<typeof TaskUpdatedEventSchema>;
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

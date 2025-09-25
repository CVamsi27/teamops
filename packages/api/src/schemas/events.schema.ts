import { z } from 'zod';
import { ID, ISODateString, TaskStatus, Priority } from './common';

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
  priority: Priority.optional(),
  updatedAt: ISODateString,
});

export type TaskCreatedEvent = z.infer<typeof TaskCreatedEventSchema>;
export type TaskUpdatedEvent = z.infer<typeof TaskUpdatedEventSchema>;

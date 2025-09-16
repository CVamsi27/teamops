import { z } from 'zod';
import { ID, ISODateString, TaskPriority } from './common';

export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const CreateTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().max(5000).nullable().optional(),
    priority: TaskPriority,
    status: TaskStatus,
    dueDate: ISODateString.nullable().optional(),
    projectId: ID.nullable(),
    assigneeId: ID.nullable().optional(),
  })
  .strict();

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskSchema = CreateTaskSchema.extend({
  id: ID,
  createdAt: ISODateString.optional(),
  updatedAt: ISODateString.optional(),
}).strict();

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;

import { z } from 'zod';
import {
  ID,
  ISODateString,
  TaskStatus,
  Priority,
  TimestampFields,
} from './common';

export const CreateTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().max(5000).nullable().optional(),
    priority: Priority.default('P3'),
    status: TaskStatus.default('TODO'),
    dueDate: ISODateString.nullable().optional(),
    projectId: ID,
    assigneeId: ID.nullable().optional(),
  })
  .strict();

export const UpdateTaskSchema = CreateTaskSchema.partial().omit({
  projectId: true,
});

export const TaskSchema = CreateTaskSchema.extend({
  id: ID,
  ...TimestampFields,
}).strict();

export const TaskWithRelationsSchema = TaskSchema.extend({
  project: z
    .object({
      id: ID,
      name: z.string(),
    })
    .optional(),
  assignee: z
    .object({
      id: ID,
      name: z.string().nullable(),
      email: z.email(),
    })
    .nullable()
    .optional(),
}).strict();

export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskWithRelations = z.infer<typeof TaskWithRelationsSchema>;

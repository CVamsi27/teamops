import { z } from 'zod';

export const ID = z.string().min(1).describe('Identifier');
export const ISODateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Invalid ISO date string',
  });

export const TaskPriority = z.enum(['1', '2', '3', '4', '5']);
export type TaskPriority = z.infer<typeof TaskPriority>;

import { z } from 'zod';

export const ID = z.string().min(1).describe('Identifier');
export const ISODateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Invalid ISO date string',
  });

export const Role = z.enum(['ADMIN', 'MEMBER', 'VIEWER']);
export const TaskStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const Priority = z.enum(['P1', 'P2', 'P3', 'P4', 'P5']);
export const TaskPriority = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const TimestampFields = {
  createdAt: ISODateString.optional(),
  updatedAt: ISODateString.optional(),
};

export type Role = z.infer<typeof Role>;
export type TaskStatus = z.infer<typeof TaskStatus>;
export type Priority = z.infer<typeof Priority>;
export type TaskPriority = z.infer<typeof TaskPriority>;

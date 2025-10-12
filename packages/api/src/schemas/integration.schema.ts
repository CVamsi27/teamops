import { z } from 'zod';
import { ID, ISODateString, TimestampFields } from './common';

export const SyncStatusSchema = z.object({
  message: z.string(),
  tasksCount: z.number().optional(),
  projectsCount: z.number().optional(),
}).strict();

export const SyncResponseSchema = z.object({
  success: z.boolean(),
  eventId: z.string().optional(),
  message: z.string(),
}).strict();

export const CalendarIntegrationSchema = z.object({
  id: ID,
  userId: ID,
  provider: z.literal('google'),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: ISODateString.optional(),
  connected: z.boolean().default(false),
  ...TimestampFields,
}).strict();

export const ConnectionStatusSchema = z.object({
  connected: z.boolean(),
  provider: z.string(),
  lastSync: ISODateString.optional(),
}).strict();

export type SyncStatus = z.infer<typeof SyncStatusSchema>;
export type SyncResponse = z.infer<typeof SyncResponseSchema>;
export type CalendarIntegration = z.infer<typeof CalendarIntegrationSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
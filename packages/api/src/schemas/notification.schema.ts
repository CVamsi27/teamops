import { z } from 'zod';
import { ID, ISODateString, TimestampFields } from './common';

export const NotificationSchema = z
  .object({
    id: ID,
    type: z.string(),
    title: z.string(),
    message: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
    userId: ID,
    read: z.boolean().default(false),
    ...TimestampFields,
  })
  .strict();

export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateNotificationSchema = z
  .object({
    read: z.boolean(),
  })
  .strict();

export const NotificationPayloadSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
});

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotification = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;
export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

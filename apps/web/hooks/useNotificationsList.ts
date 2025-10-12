import { useApiQuery } from './api/useApiQuery';
import { useApiMutation } from './api/useApiMutation';
import { NotificationSchema, MarkAsReadSchema, MarkAllAsReadSchema, type Notification } from '@workspace/api';
import { z } from 'zod';

const NotificationsListSchema = z.array(NotificationSchema);

export function useNotificationsList() {
  return useApiQuery<Notification[]>(['notifications'], '/notifications', NotificationsListSchema);
}

export function useMarkNotificationAsRead() {
  return useApiMutation<void, { id: string }>(
    '/notifications/mark-read',
    ['notifications'],
    MarkAsReadSchema,
    {
      method: 'patch',
      invalidateKeys: [['notifications']],
      buildEndpoint: (payload) => `/notifications/${payload.id}/mark-read`,
    }
  );
}

export function useMarkAllNotificationsAsRead() {
  return useApiMutation<void, {}>(
    '/notifications/mark-all-read',
    ['notifications'],
    MarkAllAsReadSchema,
    {
      method: 'patch',
      invalidateKeys: [['notifications']],
    }
  );
}
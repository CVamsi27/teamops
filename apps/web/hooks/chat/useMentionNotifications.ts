import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface MentionNotification {
  userId: string;
  title: string;
  message: string;
  type: 'MENTION';
  data: {
    messageId: string;
    authorName: string;
    roomId: string;
    roomType: string;
    mentionedUser: {
      userId: string;
      userName: string;
      userEmail: string;
    };
    timestamp: string;
  };
}

/**
 * Hook to listen for mention notifications via WebSocket
 * Automatically updates the notifications query cache
 */
export function useMentionNotifications() {
  const queryClient = useQueryClient();
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;

        webSocketRef.current = new WebSocket(wsUrl);

        webSocketRef.current.onmessage = (event: MessageEvent) => {
          try {
            const notification = JSON.parse(event.data) as MentionNotification;

            if (notification.type === 'MENTION') {
              // Invalidate notifications query to refetch
              queryClient.invalidateQueries({ queryKey: ['notifications'] });

              // Show browser notification if available and permitted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                  body: notification.message,
                  tag: `mention-${notification.data.messageId}`,
                });
              }
            }
          } catch (error) {
            console.error('Error processing notification:', error);
          }
        };

        webSocketRef.current.onerror = (error: Event) => {
          console.error('WebSocket error:', error);
        };

        webSocketRef.current.onclose = () => {
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [queryClient]);

  return webSocketRef;
}

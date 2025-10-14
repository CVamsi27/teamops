"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Bell,
  Check,
  Clock,
  Users,
  CheckSquare,
  FolderOpen,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { toast } from "@workspace/ui/components/toast";
import { useNotificationsList } from "@/hooks/useNotificationsList";
import { useApiMutation } from "@/hooks/api/useApiMutation";
import {
  type Notification,
  MarkAsReadSchema,
  MarkAllAsReadSchema,
} from "@workspace/api";

export function NotificationCenter() {
  const { data: notifications, isLoading } = useNotificationsList();

  const markAsRead = useApiMutation<{ success: boolean }, { id: string }>(
    "/api/notifications/:id/read",
    ["notifications"],
    MarkAsReadSchema,
    {
      method: "put",
      buildEndpoint: (payload) => `/api/notifications/${payload.id}/read`,
    },
  );

  const markAllAsRead = useApiMutation<
    { success: boolean },
    Record<string, never>
  >(
    "/api/notifications/mark-all-read",
    ["notifications"],
    MarkAllAsReadSchema,
    {
      method: "put",
    },
  );
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount =
    notifications?.filter((n: Notification) => !n.read).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <CheckSquare className="h-4 w-4" />;
      case "TASK_UPDATED":
        return <Clock className="h-4 w-4" />;
      case "TEAM_INVITE":
        return <Users className="h-4 w-4" />;
      case "PROJECT_CREATED":
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return "bg-blue-500";
      case "TASK_UPDATED":
        return "bg-yellow-500";
      case "TEAM_INVITE":
        return "bg-green-500";
      case "PROJECT_CREATED":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync({ id });
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to mark notification as read", {
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync({});
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all notifications as read", {
        description: "Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent/50 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${
                    !notification.read
                      ? "bg-blue-50/50 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-1 ${getNotificationColor(notification.type)}`}
                    >
                      <div className="text-white">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(
                          notification.createdAt || new Date().toISOString(),
                        )}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

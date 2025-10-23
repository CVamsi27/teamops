"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import { formatDistanceToNow } from "date-fns";
import { ActivityEventSchema, type ActivityEvent } from "@workspace/api";
import { z } from "zod";
import {
  Clock,
  UserPlus,
  UserMinus,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  Users,
  FolderPlus,
} from "lucide-react";

interface ActivityTimelineProps {
  entityId?: string;
  entityType?: "task" | "project" | "team";
  limit?: number;
}

export function ActivityTimeline({
  entityId,
  entityType,
  limit = 50,
}: ActivityTimelineProps) {
  const endpoint =
    entityId && entityType
      ? `/activity/${entityType}/${entityId}`
      : "/activity";

  const queryKey =
    entityId && entityType ? ["activity", entityType, entityId] : ["activity"];

  const {
    data: activities,
    isLoading,
    error,
  } = useApiQuery<ActivityEvent[]>(
    queryKey,
    endpoint,
    z.array(ActivityEventSchema),
    {
      refetchInterval: 30000,
    },
  );

  const getActivityIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "task_created":
        return <Circle className="h-4 w-4 text-blue-500" />;
      case "task_updated":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "task_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "project_created":
        return <FolderPlus className="h-4 w-4 text-blue-500" />;
      case "project_updated":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "project_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "team_created":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "team_updated":
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case "member_added":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "member_removed":
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "due_date_changed":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: ActivityEvent) => {
    const { type, userName, entityName, metadata } = activity;

    switch (type) {
      case "task_created":
        return `${userName} created task "${entityName}"`;
      case "task_updated": {
        // Check if this is an assignment change
        if (metadata?.newAssigneeId) {
          return `${userName} reassigned "${entityName}"`;
        }
        return `${userName} updated task "${entityName}"`;
      }
      case "task_completed":
        return `${userName} completed task "${entityName}"`;
      case "task_deleted":
        return `${userName} deleted task "${entityName}"`;
      case "project_created":
        return `${userName} created project "${entityName}"`;
      case "project_updated":
        return `${userName} updated project "${entityName}"`;
      case "project_deleted":
        return `${userName} deleted project "${entityName}"`;
      case "team_created":
        return `${userName} created team "${entityName}"`;
      case "team_updated":
        return `${userName} updated team "${entityName}"`;
      case "member_added":
        return `${userName} added a member to "${entityName}"`;
      case "member_removed":
        return `${userName} removed a member from "${entityName}"`;
      case "comment_added":
        return `${userName} commented on "${entityName}"`;
      case "due_date_changed": {
        const oldDate = metadata?.oldDueDate as string | undefined;
        const newDate = metadata?.newDueDate as string | undefined;
        if (oldDate && newDate) {
          return `${userName} changed due date of "${entityName}" from ${new Date(oldDate).toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()}`;
        } else if (newDate) {
          return `${userName} set due date of "${entityName}" to ${new Date(newDate).toLocaleDateString()}`;
        } else {
          return `${userName} removed due date from "${entityName}"`;
        }
      }
      default:
        return `${userName} performed an action on "${entityName}"`;
    }
  };

  const getActivityBadge = (activity: ActivityEvent) => {
    const { type, entityType } = activity;

    if (type.includes("task")) return <Badge variant="outline">Task</Badge>;
    if (type.includes("project"))
      return <Badge variant="secondary">Project</Badge>;
    if (type.includes("team") || type.includes("member"))
      return <Badge variant="default">Team</Badge>;
    if (type === "comment_added")
      return <Badge variant="secondary">Comment</Badge>;

    return <Badge variant="outline">{entityType}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Failed to load activity timeline. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = activities?.slice(0, limit) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
          {entityId && entityType && (
            <Badge variant="outline" className="ml-auto">
              {entityType} specific
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {displayedActivities.length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activity to show yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {displayedActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-4 border-l-2 border-l-transparent hover:border-l-primary/50 hover:bg-muted/30 transition-colors ${
                    index !== displayedActivities.length - 1 ? "border-b" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.userName}`}
                    />
                    <AvatarFallback>
                      {getInitials(activity.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityIcon(activity.type)}
                          <p className="text-sm font-medium text-foreground">
                            {getActivityMessage(activity)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          {getActivityBadge(activity)}
                        </div>
                      </div>
                    </div>

                    {activity.metadata?.comment &&
                    typeof activity.metadata.comment === "string" ? (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        &quot;{activity.metadata.comment}&quot;
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

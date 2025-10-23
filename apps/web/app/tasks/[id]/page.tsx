"use client";

import { useParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { LiveChat } from "@/components/chat/live-chat";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;

  const { get } = useTasks();
  const { list: projectsQuery } = useProjects();
  const taskQuery = get(taskId);

  if (taskQuery.isLoading || projectsQuery.isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="py-12">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-12">
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (taskQuery.error || !taskQuery.data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Task not found or you don&apos;t have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const task = taskQuery.data;
  const project = projectsQuery.data?.find((p) => p.id === task.projectId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Circle className="h-5 w-5 text-gray-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "DONE":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "outline";
      case "IN_PROGRESS":
        return "default";
      case "DONE":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {getStatusIcon(task.status)}
            {task.title}
          </h1>
          {task.description && (
            <p className="text-muted-foreground mt-2">{task.description}</p>
          )}
        </div>
      </div>

      {/* Task Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Task Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <Badge
                  variant={
                    getStatusColor(task.status) as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                  }
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium mb-2">Priority</h3>
                <Badge
                  variant={
                    getPriorityColor(task.priority) as
                      | "default"
                      | "secondary"
                      | "destructive"
                      | "outline"
                  }
                >
                  {task.priority}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium mb-2">Project</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {project?.name || "Unknown Project"}
                  </Badge>
                  {project && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {task.dueDate && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </h3>
                  <p className="text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              {task.assigneeId && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignee
                  </h3>
                  <div>
                    <p className="text-sm font-medium">
                      {task.assignee?.name || task.assignee?.email || "Unknown"}
                    </p>
                    {task.assignee?.email && (
                      <p className="text-xs text-muted-foreground">
                        {task.assignee.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Created</h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(task.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {task.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Description</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat and Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Chat */}
        <div>
          <LiveChat roomId={taskId} roomType="task" roomName={task.title} />
        </div>

        {/* Activity Timeline */}
        <div>
          <ActivityTimeline entityId={taskId} entityType="task" limit={20} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/tasks/${taskId}/edit`}>Edit Task</Link>
            </Button>
            {task.status !== "DONE" && (
              <Button variant="default">Mark as Complete</Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/tasks/new">Create Related Task</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

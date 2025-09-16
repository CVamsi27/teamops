"use client";
import { useTasks } from "@/hooks/tasks/useTasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

function TaskCardContent() {
  const { data, isLoading, isError } = useTasks();

  if (isLoading) {
    return (
      <CardContent className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 p-3 rounded border">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </CardContent>
    );
  }

  if (isError) {
    return (
      <CardContent>
        <div className="text-red-500">Error loading tasks.</div>
      </CardContent>
    );
  }

  if (!data || data.length === 0) {
    return (
      <CardContent>
        <div>No tasks available.</div>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-2">
      {data.map((t) => (
        <div key={t.id} className="p-3 rounded border">
          <div className="font-medium">{t.title}</div>
          <div className="text-sm text-muted-foreground">
            {t.status} • Priority {t.priority}
          </div>
          {t.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due {t.dueDate.slice(0, 10)}
            </div>
          )}
        </div>
      ))}
    </CardContent>
  );
}

export default function RenderTask() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <TaskCardContent />
    </Card>
  );
}
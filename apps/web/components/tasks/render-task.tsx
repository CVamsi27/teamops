"use client";
import { useTasks } from "@/hooks/tasks/useTasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Eye } from "lucide-react";
import Link from "next/link";

function TaskCardContent() {
  const { list: { data, isLoading, isError } } = useTasks();

  if (isLoading) {
    return (
      <CardContent className="flex flex-col card-spacing">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col card-spacing padding-card rounded border"
          >
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
        <div className="text-destructive">Error loading tasks.</div>
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
    <CardContent className="flex flex-col card-spacing">
      {data.map((t) => (
        <div key={t.id} className="padding-card rounded border flex justify-between items-center">
          <div className="flex-1">
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
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tasks/${t.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
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

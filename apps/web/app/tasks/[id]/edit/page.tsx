"use client";
import { useParams } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditTaskPage() {
  const params = useParams();
  const taskId = params.id as string;

  const { get } = useTasks();
  const taskQuery = get(taskId);

  if (taskQuery.isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading task...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (taskQuery.error || !taskQuery.data) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
              Task not found or you don&apos;t have permission to edit it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <TaskForm mode="edit" task={taskQuery.data} />;
}

"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskSchema, type CreateTask } from "@workspace/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { useCreateTask } from "@/hooks/tasks/useCreateTask";
import { toast } from "@workspace/ui/components/toast";

export default function CreateTask() {
  const create = useCreateTask();
  const { register, handleSubmit, formState, reset } = useForm<CreateTask>({
    resolver: zodResolver(CreateTaskSchema),
  });

  const onCreateTask = (payload: CreateTask) => {
    create.mutate(payload, {
      onSuccess: () => {
        reset();
        toast.success("Task created successfully!");
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to create task.");
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onCreateTask)}
          className="space-y-3"
        >
          <Input placeholder="Title" {...register("title")} />
          {formState.errors.title && (
            <p className="text-red-600 text-sm">
              {formState.errors.title.message}
            </p>
          )}

          <Textarea placeholder="Description" {...register("description")} />

          <Input
            placeholder="Due date"
            type="date"
            {...register("dueDate")}
          />

          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
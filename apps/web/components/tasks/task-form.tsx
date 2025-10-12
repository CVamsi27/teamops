"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { type CreateTask, type UpdateTask, type Task } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/components/toast";
import { ArrowLeft, Plus, Edit, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/const";

interface TaskFormProps {
  mode: "create" | "edit";
  task?: Task;
  onSuccess?: () => void;
}

type TaskFormData = {
  title: string;
  description?: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  projectId?: string;
  dueDate?: string | null;
};

export function TaskForm({ mode, task, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const { create, update } = useTasks();
  const { list: projectsQuery } = useProjects();
  
  const today = new Date().toISOString().split('T')[0];
  
  const form = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      projectId: mode === "create" ? "" : undefined,
      dueDate: today,
    },
  });

  useEffect(() => {
    if (mode === "edit" && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : today,
      });
    }
  }, [task, form, mode, today]);

  const onSubmit = (data: TaskFormData) => {
    if (mode === "create") {
      const createData: CreateTask = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        projectId: data.projectId!,
        dueDate: data.dueDate || null,
      };
      
      create.mutate(createData, {
        onSuccess: () => {
          onSuccess?.();
          router.push("/tasks");
        },
        onError: () => {
          toast.error("Failed to create task", {
            description: "Please try again with valid information.",
            duration: 5000,
          });
        },
      });
    } else if (mode === "edit" && task) {
      const updateData: UpdateTask = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      
      update.mutate(
        { id: task.id, payload: updateData },
        {
          onSuccess: () => {
            onSuccess?.();
            router.push("/tasks");
          },
          onError: () => {
            toast.error("Failed to update task", {
              description: "Please try again with valid information.",
              duration: 5000,
            });
          },
        }
      );
    }
  };

  const isLoading = mode === "create" ? create.isPending : update.isPending;
  const project = mode === "edit" && task ? projectsQuery.data?.find(p => p.id === task.projectId) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create" 
              ? "Add a new task to track your work and progress"
              : `Update the details for "${task?.title}"`
            }
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === "create" ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
            Task Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                {...form.register("title", { required: "Task title is required" })}
                placeholder="Enter task title"
                className="text-base"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe what needs to be done..."
                rows={4}
                className="text-base resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide additional details about the task
              </p>
            </div>

            {mode === "create" ? (
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select
                  onValueChange={(value) => form.setValue("projectId", value)}
                  value={form.watch("projectId") || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsQuery.data?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mode === "create" && form.formState.errors.projectId && (
                  <p className="text-sm text-destructive">
                    Project is required
                  </p>
                )}
                {!projectsQuery.data?.length && (
                  <p className="text-sm text-muted-foreground">
                    No projects available.{" "}
                    <Link href="/projects/new" className="underline hover:text-foreground">
                      Create a project first
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Project *</Label>
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                  <strong>Current Project:</strong> {project?.name || "Unknown Project"}
                  <br />
                  <em>Project assignment cannot be changed when editing a task</em>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  onValueChange={(value) => form.setValue("priority", value as TaskFormData["priority"])}
                  value={form.watch("priority")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value as TaskFormData["status"])}
                  value={form.watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value === "TODO"} 
                        {option.value === "IN_PROGRESS"} 
                        {option.value === "DONE"} 
                        {" "}{option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                  className="text-base"
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground">
                {mode === "create" ? "Default is set to today's date" : "Optional: Update the due date"}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/tasks">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={
                  isLoading || 
                  !form.watch("title") || 
                  (mode === "create" && !form.watch("projectId"))
                }
              >
                {isLoading 
                  ? (mode === "create" ? "Creating..." : "Updating...") 
                  : (mode === "create" ? "Create Task" : "Update Task")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import { Task, CreateTask, CreateTaskSchema } from "@workspace/api";
import { useApiMutation } from "@/hooks/useApiMutation";

export function useCreateTask() {
  return useApiMutation<Task, CreateTask>("/tasks", ["tasks"], CreateTaskSchema);
}
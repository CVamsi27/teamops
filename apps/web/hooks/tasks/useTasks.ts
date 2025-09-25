import { Task, TaskSchema } from "@workspace/api";
import { z } from "zod";
import { useApiQuery } from "@/hooks/useApiQuery";

export function useTasks() {
  return useApiQuery<Task[]>(["tasks"], "/tasks", z.array(TaskSchema));
}

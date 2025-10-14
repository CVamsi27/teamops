import {
  Task,
  TaskSchema,
  CreateTask,
  UpdateTask,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "@workspace/api";
import { z } from "zod";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import { useApiMutation } from "@/hooks/api/useApiMutation";

export function useTasks() {
  const list = useApiQuery<Task[]>(["tasks"], "/tasks", z.array(TaskSchema));

  const get = (id: string) =>
    useApiQuery<Task>(["task", id], `/tasks/${id}`, TaskSchema);

  const create = useApiMutation<Task, CreateTask>(
    "/tasks",
    ["tasks"],
    CreateTaskSchema,
    {
      method: "post",
      buildOptimistic: (data) =>
        ({
          id: "temp",
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) as Task,
    },
  );

  const update = useApiMutation<Task, { id: string; payload: UpdateTask }>(
    "/tasks",
    ["tasks"],
    z.object({
      id: z.string(),
      payload: UpdateTaskSchema,
    }),
    {
      method: "patch",
      buildEndpoint: ({ id }) => `/tasks/${id}`,
    },
  );

  const remove = useApiMutation<void, { id: string }>(
    "/tasks",
    ["tasks"],
    z.object({ id: z.string() }),
    {
      method: "delete",
      buildEndpoint: ({ id }) => `/tasks/${id}`,
    },
  );

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

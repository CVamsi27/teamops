import {
  Task,
  CreateTask,
  UpdateTask,
  TaskSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
} from "@workspace/api";
import { useApiQuery } from "../useApiQuery";
import { useApiMutation } from "../useApiMutation";
import { z } from "zod";

export function useTaskOperations() {
  const list = useApiQuery<Task[]>(["tasks"], "/tasks", z.array(TaskSchema));
  const get = (id: string) =>
    useApiQuery<Task>(["tasks", id], `/tasks/${id}`, TaskSchema);
  const create = useApiMutation<Task, CreateTask>(
    "/tasks",
    ["tasks"],
    CreateTaskSchema,
    {
      buildOptimistic: (newTask) =>
        ({
          id: "tmp-" + Date.now(),
          ...newTask,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) as Task,
    },
  );

  const UpdateWithIdSchema = z.object({
    id: z.string(),
    payload: UpdateTaskSchema,
  });

  const update = useApiMutation<Task, { id: string; payload: UpdateTask }>(
    "/tasks",
    ["tasks"],
    UpdateWithIdSchema,
    {
      method: "patch",
      buildEndpoint: (data) => `/tasks/${data.id}`,
    },
  );

  const DeleteSchema = z.object({
    id: z.string(),
  });

  const remove = useApiMutation<Task, { id: string }>(
    "/tasks",
    ["tasks"],
    DeleteSchema,
    {
      method: "delete",
      buildEndpoint: (data) => `/tasks/${data.id}`,
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

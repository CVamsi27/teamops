import {
  ProjectSchema,
  type CreateProject,
  type Project,
  type UpdateProject,
  CreateProjectSchema,
  UpdateProjectSchema,
} from "@workspace/api";
import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import z from "zod";

export function useProjects() {
  const list = useApiQuery<Project[]>(
    ["projects"],
    "/projects",
    z.array(ProjectSchema),
  );

  const create = useApiMutation<Project, CreateProject>(
    "/projects",
    ["projects"],
    CreateProjectSchema,
    {
      buildOptimistic: (newProject) =>
        ({
          id: "tmp-" + Date.now(),
          ...newProject,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) as Project,
    },
  );

  const UpdateWithIdSchema = z.object({
    id: z.string(),
    payload: UpdateProjectSchema,
  });

  const update = useApiMutation<
    Project,
    { id: string; payload: UpdateProject }
  >("/projects", ["projects"], UpdateWithIdSchema, {
    method: "patch",
    buildEndpoint: (data) => `/projects/${data.id}`,
  });

  const DeleteSchema = z.object({
    id: z.string(),
  });

  const remove = useApiMutation<string, { id: string }>(
    "/projects",
    ["projects"],
    DeleteSchema,
    {
      method: "delete",
      buildEndpoint: (data) => `/projects/${data.id}`,
    },
  );

  return { list, create, update, remove };
}

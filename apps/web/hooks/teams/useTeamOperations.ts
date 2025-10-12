import {
  Team,
  CreateTeam,
  UpdateTeam,
  TeamSchema,
  CreateTeamSchema,
  UpdateTeamSchema,
} from "@workspace/api";
import { useApiQuery } from "../api/useApiQuery";
import { useApiMutation } from "../api/useApiMutation";
import { z } from "zod";

export function useTeamOperations() {
  const list = useApiQuery<Team[]>(["teams"], "/teams", z.array(TeamSchema));

  const get = (id: string) =>
    useApiQuery<Team>(["teams", id], `/teams/${id}`, TeamSchema);

  const create = useApiMutation<Team, CreateTeam>(
    "/teams",
    ["teams"],
    CreateTeamSchema,
    {
      buildOptimistic: (newTeam) =>
        ({
          id: "tmp-" + Date.now(),
          ...newTeam,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }) as Team,
    },
  );

  const UpdateWithIdSchema = z.object({
    id: z.string(),
    payload: UpdateTeamSchema,
  });

  const update = useApiMutation<Team, { id: string; payload: UpdateTeam }>(
    "/teams",
    ["teams"],
    UpdateWithIdSchema,
    {
      method: "patch",
      buildEndpoint: (data) => `/teams/${data.id}`,
    },
  );

  const DeleteSchema = z.object({
    id: z.string(),
  });

  const remove = useApiMutation<string, { id: string }>(
    "/teams",
    ["teams"],
    DeleteSchema,
    {
      method: "delete",
      buildEndpoint: (data) => `/teams/${data.id}`,
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

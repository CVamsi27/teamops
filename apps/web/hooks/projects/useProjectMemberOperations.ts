import { useApiMutation } from "@/hooks/api/useApiMutation";
import {
  CreateProjectMembershipSchema,
  UpdateProjectMembershipSchema,
  type CreateProjectMembership,
  type UpdateProjectMembership,
} from "@workspace/api";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

export function useAddProjectMember() {
  const qc = useQueryClient();
  const mutation = useApiMutation<{ success: boolean }, CreateProjectMembership>(
    "/projects",
    ["project-members"],
    CreateProjectMembershipSchema,
    {
      buildEndpoint: (payload) => `/projects/${payload.projectId}/members`,
      invalidateKeys: [["project-members"]],
    },
  );

  // Wrap to also invalidate project-specific key
  const originalMutateAsync = mutation.mutateAsync;
  mutation.mutateAsync = async (payload: CreateProjectMembership) => {
    const result = await originalMutateAsync(payload);
    qc.invalidateQueries({ queryKey: ["project-members", payload.projectId] });
    return result;
  };

  return mutation;
}

export function useUpdateProjectMemberRole() {
  const qc = useQueryClient();
  const UpdateWithIdSchema = z.object({
    projectId: z.string(),
    memberId: z.string(),
    role: z.enum(["LEAD", "CONTRIBUTOR", "REVIEWER", "VIEWER"]),
  });

  const mutation = useApiMutation<
    { success: boolean },
    { projectId: string; memberId: string; role: string }
  >(
    "/projects",
    ["project-members"],
    UpdateWithIdSchema,
    {
      method: "patch",
      buildEndpoint: (data) => `/projects/${data.projectId}/members/${data.memberId}`,
      buildPayload: (data) => ({ role: data.role }),
      invalidateKeys: [["project-members"]],
    },
  );

  // Wrap to also invalidate project-specific key
  const originalMutateAsync = mutation.mutateAsync;
  mutation.mutateAsync = async (
    data: { projectId: string; memberId: string; role: string }
  ) => {
    const result = await originalMutateAsync(data);
    qc.invalidateQueries({ queryKey: ["project-members", data.projectId] });
    return result;
  };

  return mutation;
}

export function useRemoveProjectMember() {
  const qc = useQueryClient();
  const RemoveSchema = z.object({
    projectId: z.string(),
    memberId: z.string(),
  });

  const mutation = useApiMutation<{ success: boolean }, { projectId: string; memberId: string }>(
    "/projects",
    ["project-members"],
    RemoveSchema,
    {
      method: "delete",
      buildEndpoint: (data) => `/projects/${data.projectId}/members/${data.memberId}`,
      invalidateKeys: [["project-members"]],
    },
  );

  // Wrap to also invalidate project-specific key
  const originalMutateAsync = mutation.mutateAsync;
  mutation.mutateAsync = async (data: { projectId: string; memberId: string }) => {
    const result = await originalMutateAsync(data);
    qc.invalidateQueries({ queryKey: ["project-members", data.projectId] });
    return result;
  };

  return mutation;
}

import { useApiMutation } from "@/hooks/api/useApiMutation";
import { useApiQuery } from "@/hooks/api/useApiQuery";
import {
  InviteMemberSchema,
  AssignRoleSchema,
  RemoveMemberSchema,
  MembershipSchema,
  type InviteMember,
  type AssignRole,
  type RemoveMember,
  type Membership,
} from "@workspace/api";
import { z } from "zod";

export function useInviteMember() {
  return useApiMutation<{ success: boolean }, InviteMember>(
    "/teams",
    ["team-invites"],
    InviteMemberSchema,
    {
      buildEndpoint: (payload) => `/teams/${payload.teamId}/invite`,
      invalidateKeys: [["teams"], ["team-members"]],
    },
  );
}

export function useAssignRole() {
  return useApiMutation<{ success: boolean }, AssignRole>(
    "/teams",
    ["team-roles"],
    AssignRoleSchema,
    {
      method: "patch",
      buildEndpoint: (payload) =>
        `/teams/${payload.teamId}/members/${payload.userId}/role`,
      buildPayload: (payload) => ({ role: payload.role }),
      invalidateKeys: [["teams"], ["team-members"]],
    },
  );
}

export function useRemoveMember() {
  return useApiMutation<{ success: boolean }, RemoveMember>(
    "/teams",
    ["team-members"],
    RemoveMemberSchema,
    {
      method: "delete",
      buildEndpoint: (payload) =>
        `/teams/${payload.teamId}/members/${payload.userId}`,
      invalidateKeys: [["teams"], ["team-members"]],
    },
  );
}

export function useTeamMembers(teamId: string) {
  const MemberWithUserSchema = MembershipSchema.extend({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }).optional(),
  }).strict().optional();

  const MembersArraySchema = z.array(MembershipSchema.extend({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }).optional(),
  }));

  return useApiQuery<z.infer<typeof MembersArraySchema>>(
    ["team-members", teamId],
    `/teams/${teamId}/members`,
    MembersArraySchema,
  );
}


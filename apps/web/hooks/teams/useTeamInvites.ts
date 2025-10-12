import { useApiMutation } from '@/hooks/api/useApiMutation';
import { 
  InviteMemberSchema, 
  AssignRoleSchema, 
  RemoveMemberSchema,
  type InviteMember,
  type AssignRole,
  type RemoveMember
} from '@workspace/api';

export function useInviteMember() {
  return useApiMutation<{ success: boolean }, InviteMember>(
    '/teams/invite',
    ['team-invites'],
    InviteMemberSchema,
    {
      invalidateKeys: [['teams'], ['team-members']],
    }
  );
}

export function useAssignRole() {
  return useApiMutation<{ success: boolean }, AssignRole>(
    '/teams/assign-role',
    ['team-roles'],
    AssignRoleSchema,
    {
      method: 'patch',
      invalidateKeys: [['teams'], ['team-members']],
    }
  );
}

export function useRemoveMember() {
  return useApiMutation<{ success: boolean }, RemoveMember>(
    '/teams/remove-member',
    ['team-members'],
    RemoveMemberSchema,
    {
      method: 'delete',
      buildEndpoint: (payload) => `/teams/${payload.teamId}/members/${payload.userId}`,
      invalidateKeys: [['teams'], ['team-members']],
    }
  );
}
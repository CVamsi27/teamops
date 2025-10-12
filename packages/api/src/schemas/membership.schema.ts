import { z } from 'zod';
import { ID, ISODateString, Role, TimestampFields } from './common';

export const CreateMembershipSchema = z
  .object({
    role: Role.default('MEMBER'),
    userId: ID,
    teamId: ID,
  })
  .strict();

export const UpdateMembershipSchema = CreateMembershipSchema.partial().omit({
  userId: true,
  teamId: true,
});

export const MembershipSchema = CreateMembershipSchema.extend({
  id: ID,
  createdAt: ISODateString.optional(),
}).strict();

// Team invite and role management schemas
export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: Role.default('MEMBER'),
  teamId: ID,
}).strict();

export const AssignRoleSchema = z.object({
  userId: ID,
  role: Role,
  teamId: ID,
}).strict();

export const RemoveMemberSchema = z.object({
  userId: ID,
  teamId: ID,
}).strict();

export type CreateMembership = z.infer<typeof CreateMembershipSchema>;
export type UpdateMembership = z.infer<typeof UpdateMembershipSchema>;
export type Membership = z.infer<typeof MembershipSchema>;
export type InviteMember = z.infer<typeof InviteMemberSchema>;
export type AssignRole = z.infer<typeof AssignRoleSchema>;
export type RemoveMember = z.infer<typeof RemoveMemberSchema>;

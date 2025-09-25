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

export type CreateMembership = z.infer<typeof CreateMembershipSchema>;
export type UpdateMembership = z.infer<typeof UpdateMembershipSchema>;
export type Membership = z.infer<typeof MembershipSchema>;

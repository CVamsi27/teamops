import { z } from 'zod';
import { ID, ISODateString, Role } from './common';

export const InviteSchema = z
  .object({
    id: ID,
    email: z.string().email(),
    role: Role.default('MEMBER'),
    token: z.string(),
    accepted: z.boolean().default(false),
    teamId: ID,
    createdAt: ISODateString.optional(),
  })
  .strict();

export const CreateInviteSchema = z
  .object({
    email: z.string().email(),
    role: Role.default('MEMBER'),
    teamId: ID,
  })
  .strict();

export const AcceptInviteSchema = z
  .object({
    token: z.string(),
  })
  .strict();

export const inviteSchema = InviteSchema;

export type Invite = z.infer<typeof InviteSchema>;
export type CreateInvite = z.infer<typeof CreateInviteSchema>;
export type AcceptInvite = z.infer<typeof AcceptInviteSchema>;

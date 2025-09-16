import { z } from 'zod';
import { ID, ISODateString } from './common';

export const CreateTeamSchema = z
  .object({
    name: z.string().min(3, 'Team name must be at least 3 characters'),
    description: z.string().max(1000).optional(),
  })
  .strict();

export const UpdateTeamSchema = CreateTeamSchema.partial();

export const TeamSchema = CreateTeamSchema.extend({
  id: ID,
  createdAt: ISODateString.optional(),
  updatedAt: ISODateString.optional(),
}).strict();

export type CreateTeam = z.infer<typeof CreateTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type Team = z.infer<typeof TeamSchema>;

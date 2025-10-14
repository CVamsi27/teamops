import { z } from 'zod';
import { ID, TimestampFields } from './common';

export const CreateTeamSchema = z
  .object({
    name: z.string().min(3, 'Team name must be at least 3 characters'),
    description: z.string().max(1000).nullable().optional(),
  })
  .strict();

export const UpdateTeamSchema = CreateTeamSchema.partial();

export const TeamSchema = CreateTeamSchema.extend({
  id: ID,
  ...TimestampFields,
}).strict();

export const TeamWithStatsSchema = TeamSchema.extend({
  memberCount: z.number().optional(),
  projectCount: z.number().optional(),
}).strict();

export type CreateTeam = z.infer<typeof CreateTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type TeamWithStats = z.infer<typeof TeamWithStatsSchema>;

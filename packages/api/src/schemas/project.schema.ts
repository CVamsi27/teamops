import { z } from 'zod';
import { ID, TimestampFields } from './common';

export const CreateProjectSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().max(2000).nullable().optional(),
    teamId: ID,
  })
  .strict();

export const CreateProjectWithCreatorSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().max(2000).nullable().optional(),
    teamId: ID,
    createdById: ID,
  })
  .strict();

export const UpdateProjectSchema = CreateProjectSchema.partial().omit({
  teamId: true,
});

export const ProjectSchema = CreateProjectWithCreatorSchema.extend({
  id: ID,
  ...TimestampFields,
}).strict();

export const ProjectWithStatsSchema = ProjectSchema.extend({
  taskCount: z.number().optional(),
  completedTaskCount: z.number().optional(),
}).strict();

export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type CreateProjectWithCreator = z.infer<
  typeof CreateProjectWithCreatorSchema
>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectWithStats = z.infer<typeof ProjectWithStatsSchema>;

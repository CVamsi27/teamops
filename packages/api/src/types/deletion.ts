import { z } from 'zod';

export const TeamDeletionInfoSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  projectsCount: z.number(),
  tasksCount: z.number(),
  projectsList: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tasksCount: z.number(),
    })
  ),
  message: z.string(),
});

export const ProjectDeletionInfoSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  tasksCount: z.number(),
  tasksList: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
    })
  ),
  message: z.string(),
});

export type TeamDeletionInfo = z.infer<typeof TeamDeletionInfoSchema>;
export type ProjectDeletionInfo = z.infer<typeof ProjectDeletionInfoSchema>;

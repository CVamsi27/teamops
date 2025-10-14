import { z } from 'zod';
import { TaskSchema } from './task.schema';
import { TeamSchema } from './team.schema';
import { ProjectSchema } from './project.schema';

export const DashboardDataSchema = z
  .object({
    upcomingTasks: z.array(TaskSchema),
    activeProjects: z.array(ProjectSchema),
    myTeams: z.array(TeamSchema),
    taskStats: z.object({
      todo: z.number(),
      inProgress: z.number(),
      done: z.number(),
    }),
  })
  .strict();

export type DashboardData = z.infer<typeof DashboardDataSchema>;

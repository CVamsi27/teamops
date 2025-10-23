import { useApiQuery } from "./api/useApiQuery";
import { z } from "zod";

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  teamId: z.string(),
});

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const DashboardDataSchema = z.object({
  upcomingTasks: z.array(TaskSchema),
  activeProjects: z.array(ProjectSchema),
  myTeams: z.array(TeamSchema),
  taskStats: z.object({
    todo: z.number(),
    inProgress: z.number(),
    done: z.number(),
  }),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

export function useDashboard() {
  return useApiQuery(["dashboard"], "/dashboard", DashboardDataSchema, {
    retry: (failureCount: number, error: unknown) => {
      const err = error as Error;
      if (
        err?.message?.includes("Unauthorized") ||
        err?.message?.includes("Data validation failed")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

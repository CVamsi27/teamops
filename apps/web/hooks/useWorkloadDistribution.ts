import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api';

export const WorkloadDistributionSchema = z
  .object({
    userId: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    totalTasks: z.number(),
    todoCount: z.number(),
    inProgressCount: z.number(),
    doneCount: z.number(),
  })
  .strict();

export type WorkloadDistribution = z.infer<typeof WorkloadDistributionSchema>;

export function useWorkloadDistribution(projectId: string | undefined) {
  return useQuery({
    queryKey: ['workload', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/workload/${projectId}`);
      return z.array(WorkloadDistributionSchema).parse(data);
    },
    enabled: !!projectId,
  });
}


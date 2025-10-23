import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const CreateTaskTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  projectId: z.string(),
  assigneeIds: z.array(z.string()).optional(),
});

const UpdateTaskTemplateSchema = CreateTaskTemplateSchema.partial();

const CreateTaskFromTemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

type CreateTaskTemplate = z.infer<typeof CreateTaskTemplateSchema>;
type UpdateTaskTemplate = z.infer<typeof UpdateTaskTemplateSchema>;
type CreateTaskFromTemplate = z.infer<typeof CreateTaskFromTemplateSchema>;

/**
 * Hook to fetch task templates for a project
 */
export function useTaskTemplates(projectId: string | null) {
  return useQuery({
    queryKey: ['taskTemplates', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const response = await fetch(`/api/projects/${projectId}/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new task template
 */
export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskTemplate) => {
      const response = await fetch('/api/task-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create template');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['taskTemplates', data.projectId],
      });
    },
  });
}

/**
 * Hook to update a task template
 */
export function useUpdateTaskTemplate(templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskTemplate) => {
      const response = await fetch(`/api/task-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update template');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['taskTemplates', data.projectId],
      });
    },
  });
}

/**
 * Hook to delete a task template
 */
export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      projectId,
    }: {
      templateId: string;
      projectId: string;
    }) => {
      const response = await fetch(`/api/task-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      return { templateId, projectId };
    },
    onSuccess: ({ projectId }) => {
      queryClient.invalidateQueries({
        queryKey: ['taskTemplates', projectId],
      });
    },
  });
}

/**
 * Hook to create a task from a template
 */
export function useCreateTaskFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: CreateTaskFromTemplate;
    }) => {
      const response = await fetch(`/api/task-templates/${templateId}/create-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task from template');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both tasks and templates
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
    },
  });
}

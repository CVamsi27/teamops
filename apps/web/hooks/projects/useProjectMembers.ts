import { useApiQuery } from "@/hooks/api/useApiQuery";
import { ProjectMembershipSchema } from "@workspace/api";
import { z } from "zod";

export function useProjectMembers(projectId: string) {
  const ProjectMemberWithUserSchema = ProjectMembershipSchema.extend({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }).optional(),
  }).strict().optional();

  const MembersArraySchema = z.array(ProjectMembershipSchema.extend({
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().nullable(),
    }).optional(),
  }));

  return useApiQuery<z.infer<typeof MembersArraySchema>>(
    ["project-members", projectId],
    `/projects/${projectId}/members`,
    MembersArraySchema,
  );
}

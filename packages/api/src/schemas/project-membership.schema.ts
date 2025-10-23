import { z } from 'zod';
import { ID, ISODateString } from './common';

export const ProjectRoleEnum = z.enum(['LEAD', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER']);

export const ProjectMembershipSchema = z
  .object({
    id: ID,
    role: ProjectRoleEnum,
    userId: ID,
    projectId: ID,
    createdAt: ISODateString.optional(),
    updatedAt: ISODateString.optional(),
  })
  .strict();

export const CreateProjectMembershipSchema = z
  .object({
    userId: ID,
    projectId: ID,
    role: ProjectRoleEnum.default('CONTRIBUTOR'),
  })
  .strict();

export const UpdateProjectMembershipSchema = z
  .object({
    role: ProjectRoleEnum,
  })
  .strict();

export const AssignProjectRoleSchema = z
  .object({
    userId: ID,
    role: ProjectRoleEnum,
  })
  .strict();

export type ProjectRole = z.infer<typeof ProjectRoleEnum>;
export type ProjectMembership = z.infer<typeof ProjectMembershipSchema>;
export type CreateProjectMembership = z.infer<typeof CreateProjectMembershipSchema>;
export type UpdateProjectMembership = z.infer<typeof UpdateProjectMembershipSchema>;
export type AssignProjectRole = z.infer<typeof AssignProjectRoleSchema>;

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { ProjectMembershipRepository, type ProjectMembership, type ProjectRole } from './project-membership.repository';
import { PrismaService } from '../../infrastructure/prisma.service';
import type {
  Project,
  CreateProjectWithCreator,
  UpdateProject,
  ProjectDeletionInfo,
} from '@workspace/api';

export interface ProjectMember extends ProjectMembership {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

@Injectable()
export class ProjectService {
  constructor(
    private repo: ProjectRepository,
    private membershipRepo: ProjectMembershipRepository,
    private prisma: PrismaService
  ) {}

  list(): Promise<Project[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Project> {
    const p = await this.repo.findOne(id);
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  create(dto: CreateProjectWithCreator): Promise<Project> {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateProject): Promise<Project> {
    const result = await this.repo.update(id, dto);
    if (!result) throw new NotFoundException('Project not found');
    return result;
  }

  async getProjectDeletionInfo(id: string): Promise<ProjectDeletionInfo> {
    const project = await this.repo.findOne(id);
    if (!project) throw new NotFoundException('Project not found');

    const tasks = await this.prisma.task.findMany({
      where: { projectId: id },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    const tasksList = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
    }));

    let message = `Deleting project "${project.name}" will permanently remove:`;

    if (tasks.length > 0) {
      message += `\n• ${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

      const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === 'IN_PROGRESS'
      ).length;
      const doneTasks = tasks.filter((t) => t.status === 'DONE').length;

      const statusBreakdown = [];
      if (todoTasks > 0) statusBreakdown.push(`${todoTasks} to do`);
      if (inProgressTasks > 0)
        statusBreakdown.push(`${inProgressTasks} in progress`);
      if (doneTasks > 0) statusBreakdown.push(`${doneTasks} completed`);

      if (statusBreakdown.length > 0) {
        message += ` (${statusBreakdown.join(', ')})`;
      }
    } else {
      message += '\n• No tasks will be affected.';
    }

    if (tasks.length > 0) {
      message += '\n\nThis action cannot be undone.';
    }

    return {
      projectId: id,
      projectName: project.name,
      tasksCount: tasks.length,
      tasksList,
      message,
    };
  }

  async remove(id: string): Promise<void> {
    const project = await this.repo.findOne(id);
    if (!project) throw new NotFoundException('Project not found');

    const success = await this.repo.delete(id);
    if (!success) throw new NotFoundException('Project not found');
  }

  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    return this.repo.findByTeamId(teamId);
  }

  async getProjectMembers(projectId: string, requesterId: string): Promise<ProjectMember[]> {
    // Check if requester is a member of the project
    const requesterMembership = await this.membershipRepo.findByUserAndProject(
      requesterId,
      projectId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.membershipRepo.findAllByProjectIdWithUser(projectId) as Promise<ProjectMember[]>;
  }

  async addProjectMember(
    projectId: string,
    userId: string,
    role: ProjectRole,
    requesterId: string
  ): Promise<ProjectMember> {
    // Check if requester is LEAD or can manage members
    const requesterMembership = await this.membershipRepo.findByUserAndProject(
      requesterId,
      projectId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this project');
    }
    if (requesterMembership.role !== 'LEAD') {
      throw new ForbiddenException(
        'Only project leads can add members'
      );
    }

    // Check if user already member
    const existingMembership = await this.membershipRepo.findByUserAndProject(
      userId,
      projectId
    );
    if (existingMembership) {
      throw new ForbiddenException('User is already a member of this project');
    }

    return this.membershipRepo.create({
      userId,
      projectId,
      role,
    }) as Promise<ProjectMember>;
  }

  async updateProjectMemberRole(
    projectId: string,
    userId: string,
    role: ProjectRole,
    requesterId: string
  ): Promise<ProjectMember> {
    // Check if requester is LEAD
    const requesterMembership = await this.membershipRepo.findByUserAndProject(
      requesterId,
      projectId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this project');
    }
    if (requesterMembership.role !== 'LEAD') {
      throw new ForbiddenException(
        'Only project leads can change member roles'
      );
    }

    // Check if target user is a member
    const targetMembership = await this.membershipRepo.findByUserAndProject(
      userId,
      projectId
    );
    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this project');
    }

    // Prevent removing the last lead
    if (targetMembership.role === 'LEAD' && role !== 'LEAD') {
      const leadCount = await (this.prisma as any).projectMembership.count({
        where: {
          projectId,
          role: 'LEAD',
        },
      });
      if (leadCount === 1) {
        throw new ForbiddenException(
          'Cannot remove the last project lead'
        );
      }
    }

    return this.membershipRepo.updateRole(userId, projectId, role) as Promise<ProjectMember>;
  }

  async removeProjectMember(
    projectId: string,
    userId: string,
    requesterId: string
  ): Promise<void> {
    // Check if requester is LEAD
    const requesterMembership = await this.membershipRepo.findByUserAndProject(
      requesterId,
      projectId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this project');
    }
    if (requesterMembership.role !== 'LEAD') {
      throw new ForbiddenException(
        'Only project leads can remove members'
      );
    }

    // Check if target is a member
    const targetMembership = await this.membershipRepo.findByUserAndProject(
      userId,
      projectId
    );
    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this project');
    }

    // Prevent removing the last lead
    if (targetMembership.role === 'LEAD') {
      const leadCount = await (this.prisma as any).projectMembership.count({
        where: {
          projectId,
          role: 'LEAD',
        },
      });
      if (leadCount === 1) {
        throw new ForbiddenException(
          'Cannot remove the last project lead'
        );
      }
    }

    await this.membershipRepo.delete(userId, projectId);
  }
}


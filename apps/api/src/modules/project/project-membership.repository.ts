import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';

export type ProjectRole = 'LEAD' | 'CONTRIBUTOR' | 'REVIEWER' | 'VIEWER';

export interface ProjectMembership {
  id: string;
  role: ProjectRole;
  userId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectMembership {
  userId: string;
  projectId: string;
  role: ProjectRole;
}

export interface ProjectMemberWithUser extends ProjectMembership {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface PrismaProjectMembership {
  id: string;
  role: ProjectRole;
  userId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

@Injectable()
export class ProjectMembershipRepository {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateProjectMembership): Promise<ProjectMembership> {
    const membership = await (this.prisma as any).projectMembership.create({
      data: {
        userId: payload.userId,
        projectId: payload.projectId,
        role: payload.role,
      },
    });
    return this.map(membership as PrismaProjectMembership);
  }

  async findByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<ProjectMembership | null> {
    const membership = await (this.prisma as any).projectMembership.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });
    return membership ? this.map(membership as PrismaProjectMembership) : null;
  }

  async findAllByProjectId(projectId: string): Promise<ProjectMembership[]> {
    const memberships = await (this.prisma as any).projectMembership.findMany({
      where: { projectId },
    });
    return (memberships as PrismaProjectMembership[]).map((m) => this.map(m));
  }

  async findAllByProjectIdWithUser(projectId: string): Promise<ProjectMemberWithUser[]> {
    const memberships = await (this.prisma as any).projectMembership.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    return (memberships as PrismaProjectMembership[]).map((m) => ({
      ...this.map(m),
      user: m.user,
    }));
  }

  async updateRole(
    userId: string,
    projectId: string,
    role: ProjectRole
  ): Promise<ProjectMembership> {
    const membership = await (this.prisma as any).projectMembership.update({
      where: {
        userId_projectId: { userId, projectId },
      },
      data: { role },
    });
    return this.map(membership as PrismaProjectMembership);
  }

  async delete(userId: string, projectId: string): Promise<void> {
    await (this.prisma as any).projectMembership.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });
  }

  private map(m: PrismaProjectMembership): ProjectMembership {
    return {
      id: m.id,
      role: m.role,
      userId: m.userId,
      projectId: m.projectId,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }
}


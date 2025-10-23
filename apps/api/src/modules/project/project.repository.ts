import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { Project as PrismaProject } from '@prisma/client';
import type {
  Project,
  CreateProjectWithCreator,
  UpdateProject,
} from '@workspace/api';

@Injectable()
export class ProjectRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(this.map);
  }

  async findOne(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    return project ? this.map(project) : null;
  }

  async findByTeamId(teamId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(this.map);
  }

  async create(payload: CreateProjectWithCreator): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description ?? null,
        teamId: payload.teamId,
        createdById: payload.createdById,
        memberships: {
          create: {
            userId: payload.createdById,
            role: 'LEAD', // Creator becomes lead of the project
          },
        },
      },
    });
    return this.map(project);
  }

  async update(id: string, payload: UpdateProject): Promise<Project | null> {
    try {
      const updateData: Record<string, unknown> = {};

      if (payload.name !== undefined) updateData.name = payload.name;
      if (payload.description !== undefined)
        updateData.description = payload.description ?? null;

      const project = await this.prisma.project.update({
        where: { id },
        data: updateData,
      });
      return this.map(project);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.project.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private map(p: PrismaProject): Project {
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      teamId: p.teamId,
      createdById: p.createdById,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}

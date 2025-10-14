import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  Team,
  CreateTeam,
  UpdateTeam,
  TeamDeletionInfo,
} from '@workspace/api';
import { TeamRepository } from './team.repository';
import { PrismaService } from '../../infrastructure/prisma.service';

@Injectable()
export class TeamService {
  constructor(
    private readonly repo: TeamRepository,
    private readonly prisma: PrismaService
  ) {}

  async list(): Promise<Team[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Team> {
    const team = await this.repo.findOne(id);
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async create(dto: CreateTeam, creatorUserId: string): Promise<Team> {
    return this.repo.createWithMembership(dto, creatorUserId);
  }

  async update(id: string, dto: UpdateTeam): Promise<Team> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Team not found');
    return updated;
  }

  async getTeamDeletionInfo(id: string): Promise<TeamDeletionInfo> {
    const team = await this.repo.findOne(id);
    if (!team) throw new NotFoundException('Team not found');

    const projects = await this.prisma.project.findMany({
      where: { teamId: id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    const totalTasksCount = await this.prisma.task.count({
      where: {
        project: {
          teamId: id,
        },
      },
    });

    const projectsList = projects.map((project) => ({
      id: project.id,
      name: project.name,
      tasksCount: project._count.tasks,
    }));

    let message = `Deleting team "${team.name}" will permanently remove:`;

    if (projects.length > 0) {
      message += `\n• ${projects.length} project${projects.length === 1 ? '' : 's'}`;
    }

    if (totalTasksCount > 0) {
      message += `\n• ${totalTasksCount} task${totalTasksCount === 1 ? '' : 's'}`;
    }

    if (projects.length === 0 && totalTasksCount === 0) {
      message += '\n• No projects or tasks will be affected.';
    } else {
      message += '\n\nThis action cannot be undone.';
    }

    return {
      teamId: id,
      teamName: team.name,
      projectsCount: projects.length,
      tasksCount: totalTasksCount,
      projectsList,
      message,
    };
  }

  async remove(id: string): Promise<void> {
    const team = await this.repo.findOne(id);
    if (!team) throw new NotFoundException('Team not found');

    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Team not found');
  }

  async getMyTeams(userId: string): Promise<Team[]> {
    return this.repo.findByUserId(userId);
  }
}

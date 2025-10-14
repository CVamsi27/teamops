import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import { PrismaService } from '../../infrastructure/prisma.service';
import type {
  Project,
  CreateProjectWithCreator,
  UpdateProject,
  ProjectDeletionInfo,
} from '@workspace/api';

@Injectable()
export class ProjectService {
  constructor(
    private repo: ProjectRepository,
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
}

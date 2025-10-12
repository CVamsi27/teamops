import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type {
  Task as PrismaTask,
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
} from '@prisma/client';
import type { Task, CreateTaskWithCreator, UpdateTask } from '@workspace/api';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    const list = await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map(this.map);
  }

  async findOne(id: string): Promise<Task | null> {
    const t = await this.prisma.task.findUnique({ where: { id } });
    return t ? this.map(t) : null;
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { assigneeId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(this.map);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(this.map);
  }

  async create(payload: CreateTaskWithCreator): Promise<Task> {
    const t = await this.prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description ?? null,
        priority: payload.priority,
        status: payload.status,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        projectId: payload.projectId ?? null,
        assigneeId: payload.assigneeId ?? null,
        createdById: payload.createdById,
      },
    });
    return this.map(t);
  }

  async update(id: string, payload: UpdateTask): Promise<Task | null> {
    try {
      const updateData: Record<string, unknown> = {};

      if (payload.title !== undefined) updateData.title = payload.title;
      if (payload.description !== undefined)
        updateData.description = payload.description ?? null;
      if (payload.status !== undefined) updateData.status = payload.status;
      if (payload.priority !== undefined)
        updateData.priority = payload.priority;
      if (payload.dueDate !== undefined)
        updateData.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
      if (payload.assigneeId !== undefined)
        updateData.assigneeId = payload.assigneeId ?? null;

      const t = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });
      return this.map(t);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private map(t: PrismaTask): Task {
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? undefined,
      status: t.status as PrismaTaskStatus,
      priority: t.priority as PrismaTaskPriority,
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      projectId: t.projectId ?? undefined,
      assigneeId: t.assigneeId ?? undefined,
      createdById: t.createdById,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}

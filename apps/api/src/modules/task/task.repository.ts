import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { Task, CreateTask, UpdateTask } from '@workspace/api';

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

  async create(payload: CreateTask): Promise<Task> {
    const t = await this.prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        priority: payload.priority
          ? (`P${payload.priority}` as any)
          : undefined,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
        projectId: payload.projectId!,
        assigneeId: payload.assigneeId ?? undefined,
      },
    });
    return this.map(t);
  }

  async update(id: string, payload: UpdateTask): Promise<Task | null> {
    try {
      const t = await this.prisma.task.update({
        where: { id },
        data: {
          title: payload.title,
          description: payload.description,
          status: payload.status as any,
          priority: payload.priority
            ? (`P${payload.priority}` as any)
            : undefined,
          dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
          assigneeId: payload.assigneeId ?? undefined,
        },
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

  private map(t: any): Task {
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? undefined,
      status: t.status,
      priority: (t.priority?.replace('P', '') ?? '3') as any,
      dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
      projectId: t.projectId,
      assigneeId: t.assigneeId ?? undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}

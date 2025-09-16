import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task, CreateTask, UpdateTask } from '@workspace/api';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  async list(): Promise<Task[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Task> {
    const t = await this.repo.findOne(id);
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async create(dto: CreateTask): Promise<Task> {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateTask): Promise<Task> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Task not found');
  }
}

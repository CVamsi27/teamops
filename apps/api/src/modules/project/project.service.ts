import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './project.repository';
import type { Project, CreateProjectWithCreator, UpdateProject } from '@workspace/api';

@Injectable()
export class ProjectService {
  constructor(private repo: ProjectRepository) {}

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

  async remove(id: string): Promise<void> {
    const success = await this.repo.delete(id);
    if (!success) throw new NotFoundException('Project not found');
  }

  async getProjectsByTeam(teamId: string): Promise<Project[]> {
    return this.repo.findByTeamId(teamId);
  }
}

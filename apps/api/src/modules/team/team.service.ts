import { Injectable, NotFoundException } from '@nestjs/common';
import type { Team, CreateTeam, UpdateTeam } from '@workspace/api';
import { TeamRepository } from './team.repository';

@Injectable()
export class TeamService {
  constructor(private readonly repo: TeamRepository) {}

  async list(): Promise<Team[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Team> {
    const team = await this.repo.findOne(id);
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async create(dto: CreateTeam): Promise<Team> {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateTeam): Promise<Team> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Team not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('Team not found');
  }
}

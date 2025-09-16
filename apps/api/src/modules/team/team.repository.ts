import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { CreateTeam, Team, UpdateTeam } from '@workspace/api';

@Injectable()
export class TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return teams.map(this.map);
  }

  async findOne(id: string): Promise<Team | null> {
    const t = await this.prisma.team.findUnique({ where: { id } });
    return t ? this.map(t) : null;
  }

  async create(payload: CreateTeam): Promise<Team> {
    const t = await this.prisma.team.create({ data: { ...payload } });
    return this.map(t);
  }

  async update(id: string, payload: UpdateTeam): Promise<Team | null> {
    try {
      const t = await this.prisma.team.update({
        where: { id },
        data: { ...payload },
      });
      return this.map(t);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.team.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private map(t: any): Team {
    return {
      id: t.id,
      name: t.name,
      description: t.description ?? undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}

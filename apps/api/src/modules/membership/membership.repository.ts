import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { Membership as PrismaMembership } from '@prisma/client';
import type { Membership, CreateMembership } from '@workspace/api';

@Injectable()
export class MembershipRepository {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateMembership): Promise<Membership> {
    const membership = await this.prisma.membership.create({
      data: {
        userId: payload.userId,
        teamId: payload.teamId,
        role: payload.role,
      },
    });
    return this.map(membership);
  }

  async findByUserAndTeam(
    userId: string,
    teamId: string
  ): Promise<Membership | null> {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });
    return membership ? this.map(membership) : null;
  }

  private map(m: PrismaMembership): Membership {
    return {
      id: m.id,
      role: m.role,
      userId: m.userId,
      teamId: m.teamId,
      createdAt: m.createdAt.toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { Invitation as PrismaInvitation } from '@prisma/client';
import type { Invite, CreateInvite } from '@workspace/api';

@Injectable()
export class InviteRepository {
  constructor(private prisma: PrismaService) {}

  async create(payload: CreateInvite & { token: string }): Promise<Invite> {
    const invitation = await this.prisma.invitation.create({
      data: {
        teamId: payload.teamId,
        email: payload.email,
        role: payload.role,
        token: payload.token,
      },
    });
    return this.map(invitation);
  }

  async findByToken(token: string): Promise<Invite | null> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });
    return invitation ? this.map(invitation) : null;
  }

  async markAccepted(id: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { accepted: true },
    });
  }

  private map(i: PrismaInvitation): Invite {
    return {
      id: i.id,
      email: i.email,
      role: i.role,
      token: i.token,
      accepted: i.accepted,
      teamId: i.teamId,
      createdAt: i.createdAt.toISOString(),
    };
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type {
  Team,
  CreateTeam,
  UpdateTeam,
  TeamDeletionInfo,
  Role,
  Membership,
} from '@workspace/api';
import { TeamRepository } from './team.repository';
import { MembershipRepository } from '../membership/membership.repository';
import { PrismaService } from '../../infrastructure/prisma.service';

export interface TeamMember extends Membership {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

@Injectable()
export class TeamService {
  constructor(
    private readonly repo: TeamRepository,
    private readonly membershipRepo: MembershipRepository,
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

  async getTeamMembers(teamId: string, requesterId: string): Promise<TeamMember[]> {
    // Check if requester is a member of the team
    const requesterMembership = await this.membershipRepo.findByUserAndTeam(
      requesterId,
      teamId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You do not have access to this team');
    }

    const memberships = await this.prisma.membership.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.id,
      role: m.role,
      userId: m.userId,
      teamId: m.teamId,
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    })) as TeamMember[];
  }

  async updateMemberRole(
    teamId: string,
    userId: string,
    role: Role,
    requesterId: string
  ): Promise<Membership> {
    // Check if requester is admin of the team
    const requesterMembership = await this.membershipRepo.findByUserAndTeam(
      requesterId,
      teamId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this team');
    }
    if (requesterMembership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can change member roles');
    }

    // Check if target user is a member of the team
    const targetMembership = await this.membershipRepo.findByUserAndTeam(
      userId,
      teamId
    );
    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this team');
    }

    // Prevent removing the last admin
    if (
      targetMembership.role === 'ADMIN' &&
      role !== 'ADMIN'
    ) {
      const adminCount = await this.prisma.membership.count({
        where: {
          teamId,
          role: 'ADMIN',
        },
      });
      if (adminCount === 1) {
        throw new ForbiddenException(
          'Cannot remove the last admin from the team'
        );
      }
    }

    return this.membershipRepo.updateRole(userId, teamId, role);
  }

  async removeMember(
    teamId: string,
    userId: string,
    requesterId: string
  ): Promise<void> {
    // Check if requester is admin of the team
    const requesterMembership = await this.membershipRepo.findByUserAndTeam(
      requesterId,
      teamId
    );
    if (!requesterMembership) {
      throw new ForbiddenException('You are not a member of this team');
    }
    if (requesterMembership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Check if target user is a member of the team
    const targetMembership = await this.membershipRepo.findByUserAndTeam(
      userId,
      teamId
    );
    if (!targetMembership) {
      throw new NotFoundException('User is not a member of this team');
    }

    // Prevent removing the last admin
    if (targetMembership.role === 'ADMIN') {
      const adminCount = await this.prisma.membership.count({
        where: {
          teamId,
          role: 'ADMIN',
        },
      });
      if (adminCount === 1) {
        throw new ForbiddenException(
          'Cannot remove the last admin from the team'
        );
      }
    }

    await this.prisma.membership.delete({
      where: {
        userId_teamId: { userId, teamId },
      },
    });
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

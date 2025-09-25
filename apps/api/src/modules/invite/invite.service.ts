import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { MembershipRepository } from '../membership/membership.repository';
import { randomUUID } from 'crypto';
import * as nodemailer from 'nodemailer';
import type { Invite, Role } from '@workspace/api';

@Injectable()
export class InviteService {
  constructor(
    private inviteRepo: InviteRepository,
    private membershipRepo: MembershipRepository
  ) {}

  async createInvite(
    teamId: string,
    email: string,
    role: Role
  ): Promise<Invite> {
    const token = randomUUID();
    const invite = await this.inviteRepo.create({
      teamId,
      email,
      role,
      token,
    });

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    const acceptUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;

    await transporter
      .sendMail({
        from: 'no-reply@teamops.app',
        to: email,
        subject: `You're invited to join a team on TeamOps`,
        text: `Join: ${acceptUrl}`,
        html: `<p>Click to join: <a href="${acceptUrl}">${acceptUrl}</a></p>`,
      })
      .catch((err) => console.warn('Mail send failed:', err.message));

    return invite;
  }

  async acceptInvite(token: string, userId: string): Promise<void> {
    const invite = await this.inviteRepo.findByToken(token);
    if (!invite) throw new NotFoundException('Invite token invalid');
    if (invite.accepted)
      throw new BadRequestException('Invite already accepted');

    const existingMembership = await this.membershipRepo.findByUserAndTeam(
      userId,
      invite.teamId
    );
    if (existingMembership) {
      throw new BadRequestException('User is already a member of this team');
    }

    await this.membershipRepo.create({
      userId,
      teamId: invite.teamId,
      role: invite.role,
    });

    await this.inviteRepo.markAccepted(invite.id);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { MembershipRepository } from '../membership/membership.repository';
import { randomUUID } from 'crypto';
import { createTransport } from 'nodemailer';
import type { Invite, Role } from '@workspace/api';

@Injectable()
export class InviteService {
  constructor(
    private inviteRepo: InviteRepository,
    private membershipRepo: MembershipRepository
  ) {}

  private canInviteRole(inviterRole: Role, targetRole: Role): boolean {
    if (inviterRole === 'ADMIN') {
      return ['ADMIN', 'MEMBER', 'VIEWER'].includes(targetRole);
    }
    if (inviterRole === 'MEMBER') {
      return targetRole === 'VIEWER';
    }
    return false;
  }

  async createInvite(
    teamId: string,
    email: string,
    role: Role,
    userId: string
  ): Promise<Invite> {
    const membership = await this.membershipRepo.findByUserAndTeam(
      userId,
      teamId
    );
    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this team'
      );
    }

    if (!this.canInviteRole(membership.role, role)) {
      throw new ForbiddenException(
        `Your role (${membership.role}) cannot invite users with role ${role}`
      );
    }
    const token = randomUUID();
    const invite = await this.inviteRepo.create({
      teamId,
      email,
      role,
      token,
    });

    const transporter = createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailgun.org',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,

      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    const acceptUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@teamops.app';
    const fromName = process.env.SMTP_FROM_NAME || 'TeamOps';

    const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>TeamOps Invitation</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px 20px; background: #ffffff; }
        .content h2 { color: #2563eb; margin-top: 0; }
        .button { 
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block;
          margin: 20px 0;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
        }
        .button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
        .footer { 
          text-align: center; 
          color: #666; 
          font-size: 14px; 
          padding: 20px; 
          background: #f8fafc; 
          border-top: 1px solid #e2e8f0;
        }
        .link { color: #2563eb; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 TeamOps</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Modern Team Collaboration</p>
        </div>
        <div class="content">
          <h2>You're invited to join a team!</h2>
          <p>Hello,</p>
          <p>You've been invited to join a team on TeamOps. Click the button below to accept your invitation and start collaborating:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="button">Accept Invitation</a>
          </div>
          <p><strong>Or copy and paste this link:</strong></p>
          <p class="link">${acceptUrl}</p>
          <p style="margin-top: 30px;"><small>This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</small></p>
        </div>
        <div class="footer">
          <p><strong>TeamOps</strong> - Streamline your team's workflow</p>
          <p>Need help? Contact us at support@teamops.app</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: `🚀 Join your team on TeamOps`,
        text: `You're invited to join a team on TeamOps!\n\nAccept your invitation: ${acceptUrl}\n\nThis invitation will expire in 7 days.`,
        html: emailTemplate,

        headers: {
          'X-Mailgun-Tag': 'team-invitation',
          'X-Mailgun-Track': 'yes',
          'X-Mailgun-Track-Clicks': 'yes',
          'X-Mailgun-Track-Opens': 'yes',
        },
      });

    } catch (error) {
      const err = error as Error;
      console.error(
        `❌ Failed to send invitation email to ${email}:`,
        err.message
      );
    }

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

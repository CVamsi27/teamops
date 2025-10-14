import { Controller, Post, Body, Req } from '@nestjs/common';
import { InviteService } from './invite.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateInviteSchema, AcceptInviteSchema } from '@workspace/api';
import type { CreateInvite, AcceptInvite, Invite } from '@workspace/api';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

@Controller('invites')
export class InviteController {
  constructor(private svc: InviteService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateInviteSchema)) body: CreateInvite
  ): Promise<Invite> {
    return this.svc.createInvite(body.teamId, body.email, body.role);
  }

  @Post('accept')
  async accept(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(AcceptInviteSchema)) body: AcceptInvite
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.svc.acceptInvite(body.token, userId);
  }
}

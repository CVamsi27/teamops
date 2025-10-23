import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateInviteSchema, AcceptInviteSchema } from '@workspace/api';
import type { CreateInvite, AcceptInvite, Invite } from '@workspace/api';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

@Controller('invites')
@UseGuards(JwtAuthGuard)
export class InviteController {
  constructor(private svc: InviteService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateInviteSchema)) body: CreateInvite,
    @Req() req: AuthenticatedRequest
  ): Promise<Invite> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.svc.createInvite(body.teamId, body.email, body.role, userId);
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

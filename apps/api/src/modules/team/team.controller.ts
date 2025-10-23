import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { TeamService, type TeamMember } from './team.service';
import { InviteService } from '../invite/invite.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ValidateResponse } from '../../common/response-validation.decorator';
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  TeamSchema,
  TeamDeletionInfoSchema,
  Role,
} from '@workspace/api';
import type {
  Team,
  CreateTeam,
  UpdateTeam,
  TeamDeletionInfo,
  Membership,
  Invite,
} from '@workspace/api';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { z } from 'zod';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(
    private readonly service: TeamService,
    private readonly inviteService: InviteService
  ) {}

  @Get()
  @ValidateResponse(z.array(TeamSchema))
  async list(@Request() req: AuthRequest): Promise<Team[] | null> {
    return this.service.getMyTeams(req.user.userId);
  }

  @Get(':id')
  @ValidateResponse(TeamSchema)
  async get(@Param('id') id: string): Promise<Team> {
    return this.service.get(id);
  }

  @Get(':id/deletion-info')
  @ValidateResponse(TeamDeletionInfoSchema)
  async getDeletionInfo(@Param('id') id: string): Promise<TeamDeletionInfo> {
    return this.service.getTeamDeletionInfo(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: AuthRequest): Promise<TeamMember[]> {
    return this.service.getTeamMembers(id, req.user.userId);
  }

  @Post()
  @ValidateResponse(TeamSchema)
  async create(
    @Body(new ZodValidationPipe(CreateTeamSchema)) body: CreateTeam,
    @Request() req: AuthRequest
  ): Promise<Team> {
    // Only ADMIN users can create teams
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only administrators can create teams'
      );
    }
    return this.service.create(body, req.user.userId);
  }

  @Post(':id/invite')
  async invite(
    @Param('id') teamId: string,
    @Body(new ZodValidationPipe(z.object({ email: z.string().email(), role: Role }))) body: { email: string; role: Role },
    @Request() req: AuthRequest
  ): Promise<Invite> {
    return this.inviteService.createInvite(
      teamId,
      body.email,
      body.role,
      req.user.userId
    );
  }

  @Patch(':id')
  @ValidateResponse(TeamSchema)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTeamSchema)) body: UpdateTeam
  ): Promise<Team> {
    return this.service.update(id, body);
  }

  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(z.object({ role: Role }))) body: { role: Role },
    @Request() req: AuthRequest
  ): Promise<Membership> {
    return this.service.updateMemberRole(
      id,
      userId,
      body.role,
      req.user.userId
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthRequest
  ): Promise<void> {
    return this.service.removeMember(id, userId, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

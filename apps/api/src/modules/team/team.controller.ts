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
} from '@nestjs/common';
import { TeamService } from './team.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ValidateResponse } from '../../common/response-validation.decorator';
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  TeamSchema,
  TeamDeletionInfoSchema,
} from '@workspace/api';
import type {
  Team,
  CreateTeam,
  UpdateTeam,
  TeamDeletionInfo,
} from '@workspace/api';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { z } from 'zod';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @Get()
  @ValidateResponse(z.array(TeamSchema))
  async list(@Request() req: any): Promise<Team[] | null> {
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

  @Post()
  @ValidateResponse(TeamSchema)
  async create(
    @Body(new ZodValidationPipe(CreateTeamSchema)) body: CreateTeam,
    @Request() req: any
  ): Promise<Team> {
    return this.service.create(body, req.user.userId);
  }

  @Patch(':id')
  @ValidateResponse(TeamSchema)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTeamSchema)) body: UpdateTeam
  ): Promise<Team> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

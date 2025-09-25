import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  HttpCode,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateTeamSchema, UpdateTeamSchema } from '@workspace/api';
import type { Team, CreateTeam, UpdateTeam } from '@workspace/api';

@Controller('teams')
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @Get()
  async list(): Promise<Team[]> {
    return this.service.list();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<Team> {
    return this.service.get(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTeamSchema))
  async create(@Body() body: CreateTeam): Promise<Team> {
    return this.service.create(body);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateTeamSchema))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTeam
  ): Promise<Team> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { TeamService } from '../team/team.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ValidateResponse } from '../../common/response-validation.decorator';
import { 
  CreateProjectSchema, 
  UpdateProjectSchema,
  ProjectSchema 
} from '@workspace/api';
import type { Project, CreateProject, UpdateProject } from '@workspace/api';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { z } from 'zod';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly service: ProjectService,
    private readonly teamService: TeamService,
  ) {}

  @Get()
  @ValidateResponse(z.array(ProjectSchema))
  async list(@Request() req: any): Promise<Project[]> {
    const userId = req.user.userId;
    const userTeams = await this.teamService.getMyTeams(userId);
    const teamIds = userTeams.map(team => team.id);
    
    const projectArrays = await Promise.all(
      teamIds.map(teamId => this.service.getProjectsByTeam(teamId))
    );
    
    return projectArrays.flat();
  }

  @Get(':id')
  @ValidateResponse(ProjectSchema)
  async get(@Param('id') id: string): Promise<Project> {
    return this.service.get(id);
  }

  @Post()
  @ValidateResponse(ProjectSchema)
  async create(
    @Body(new ZodValidationPipe(CreateProjectSchema)) body: CreateProject,
    @Request() req: any,
  ): Promise<Project> {
    const projectWithCreator = {
      ...body,
      createdById: req.user.userId,
    };
    return this.service.create(projectWithCreator);
  }

  @Patch(':id')
  @ValidateResponse(ProjectSchema)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) body: UpdateProject,
  ): Promise<Project> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

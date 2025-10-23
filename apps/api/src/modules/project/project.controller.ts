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
  HttpCode,
} from '@nestjs/common';
import { ProjectService, type ProjectMember } from './project.service';
import { TeamService } from '../team/team.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { ValidateResponse } from '../../common/response-validation.decorator';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectSchema,
  ProjectDeletionInfoSchema,
} from '@workspace/api';
import type {
  Project,
  CreateProject,
  UpdateProject,
  ProjectDeletionInfo,
} from '@workspace/api';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { z } from 'zod';
import type { ProjectRole } from './project-membership.repository';

interface AuthRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly service: ProjectService,
    private readonly teamService: TeamService
  ) {}

  @Get()
  @ValidateResponse(z.array(ProjectSchema))
  async list(@Request() req: AuthRequest): Promise<Project[]> {
    const userId = req.user.userId;
    const userTeams = await this.teamService.getMyTeams(userId);
    const teamIds = userTeams.map((team) => team.id);

    const projectArrays = await Promise.all(
      teamIds.map((teamId) => this.service.getProjectsByTeam(teamId))
    );

    return projectArrays.flat();
  }

  @Get(':id')
  @ValidateResponse(ProjectSchema)
  async get(@Param('id') id: string): Promise<Project> {
    return this.service.get(id);
  }

  @Get(':id/deletion-info')
  @ValidateResponse(ProjectDeletionInfoSchema)
  async getDeletionInfo(@Param('id') id: string): Promise<ProjectDeletionInfo> {
    return this.service.getProjectDeletionInfo(id);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Request() req: AuthRequest): Promise<ProjectMember[]> {
    return this.service.getProjectMembers(id, req.user.userId);
  }

  @Post()
  @ValidateResponse(ProjectSchema)
  async create(
    @Body(new ZodValidationPipe(CreateProjectSchema)) body: CreateProject,
    @Request() req: AuthRequest
  ): Promise<Project> {
    const projectWithCreator = {
      ...body,
      createdById: req.user.userId,
    };
    return this.service.create(projectWithCreator);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') projectId: string,
    @Body(new ZodValidationPipe(z.object({ 
      userId: z.string(),
      role: z.enum(['LEAD', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER']) 
    }))) body: { userId: string; role: ProjectRole },
    @Request() req: AuthRequest
  ): Promise<ProjectMember> {
    return this.service.addProjectMember(projectId, body.userId, body.role, req.user.userId);
  }

  @Patch(':id')
  @ValidateResponse(ProjectSchema)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) body: UpdateProject
  ): Promise<Project> {
    return this.service.update(id, body);
  }

  @Patch(':id/members/:memberId')
  async updateMemberRole(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @Body(new ZodValidationPipe(z.object({ role: z.enum(['LEAD', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER']) }))) body: { role: ProjectRole },
    @Request() req: AuthRequest
  ): Promise<ProjectMember> {
    return this.service.updateProjectMemberRole(projectId, memberId, body.role, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Delete(':id/members/:memberId')
  @HttpCode(204)
  async removeMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @Request() req: AuthRequest
  ): Promise<void> {
    return this.service.removeProjectMember(projectId, memberId, req.user.userId);
  }
}


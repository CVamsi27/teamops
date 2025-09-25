import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CreateProjectSchema, UpdateProjectSchema } from '@workspace/api';
import type { Project, CreateProject, UpdateProject } from '@workspace/api';

@Controller('projects')
export class ProjectController {
  constructor(private service: ProjectService) {}

  @Get()
  list(): Promise<Project[]> {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<Project> {
    return this.service.get(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProjectSchema))
  create(@Body() body: CreateProject): Promise<Project> {
    return this.service.create(body);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateProjectSchema))
  update(
    @Param('id') id: string,
    @Body() body: UpdateProject
  ): Promise<Project> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

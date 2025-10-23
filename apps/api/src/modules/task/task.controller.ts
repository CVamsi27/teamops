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
import { TaskService } from './task.service';
import { ValidateResponse } from '../../common/response-validation.decorator';
import { CreateTaskSchema, UpdateTaskSchema, TaskSchema } from '@workspace/api';
import type { Task, CreateTask, UpdateTask } from '@workspace/api';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  @ValidateResponse(z.array(TaskSchema))
  async list(): Promise<Task[]> {
    return this.service.list();
  }

  @Get('workload/:projectId')
  async getWorkloadDistribution(
    @Param('projectId') projectId: string
  ): Promise<
    Array<{
      userId: string;
      name: string | null;
      email: string;
      totalTasks: number;
      todoCount: number;
      inProgressCount: number;
      doneCount: number;
    }>
  > {
    return this.service.getWorkloadDistribution(projectId);
  }

  @Get(':id')
  @ValidateResponse(TaskSchema)
  async get(@Param('id') id: string): Promise<Task> {
    return this.service.get(id);
  }

  @Post()
  @ValidateResponse(TaskSchema)
  async create(
    @Body(new ZodValidationPipe(CreateTaskSchema)) body: CreateTask,
    @Request() req: AuthenticatedRequest
  ): Promise<Task> {
    const taskWithCreator = {
      ...body,
      createdById: req.user!.userId,
      // Default assigneeId to creator if not provided
      assigneeId: body.assigneeId ?? req.user!.userId,
    };
    return this.service.create(taskWithCreator);
  }

  @Patch(':id')
  @ValidateResponse(TaskSchema)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) body: UpdateTask,
    @Request() req: AuthenticatedRequest
  ): Promise<Task> {
    return this.service.update(id, body, {
      userId: req.user!.userId,
      email: req.user!.email,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<void> {
    return this.service.remove(id, {
      userId: req.user!.userId,
      email: req.user!.email,
    });
  }
}

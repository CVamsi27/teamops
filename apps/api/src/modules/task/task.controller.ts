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
import { TaskService } from './task.service';
import { CreateTaskSchema, UpdateTaskSchema, Task } from '@workspace/api';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Get()
  async list(): Promise<Task[]> {
    return this.service.list();
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<Task> {
    return this.service.get(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTaskSchema))
  async create(@Body() body: any): Promise<Task> {
    return this.service.create(body);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(UpdateTaskSchema))
  async update(@Param('id') id: string, @Body() body: any): Promise<Task> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}

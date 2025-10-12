import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TaskModule } from '../modules/task/task.module';
import { TeamModule } from '../modules/team/team.module';
import { ProjectModule } from '../modules/project/project.module';

@Module({
  imports: [TaskModule, TeamModule, ProjectModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
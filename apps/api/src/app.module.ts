import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma.module';
import { TeamModule } from './modules/team/team.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [PrismaModule, TeamModule, TaskModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectRepository } from './project.repository';
import { ProjectMembershipRepository } from './project-membership.repository';
import { TeamModule } from '../team/team.module';
import { PrismaModule } from '../../infrastructure/prisma.module';

@Module({
  imports: [TeamModule, PrismaModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectMembershipRepository],
  exports: [ProjectService, ProjectRepository, ProjectMembershipRepository],
})
export class ProjectModule {}


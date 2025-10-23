import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamRepository } from './team.repository';
import { MembershipRepository } from '../membership/membership.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { InviteService } from '../invite/invite.service';
import { InviteRepository } from '../invite/invite.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TeamController],
  providers: [
    TeamService,
    TeamRepository,
    MembershipRepository,
    InviteService,
    InviteRepository,
  ],
  exports: [TeamService, MembershipRepository],
})
export class TeamModule {}

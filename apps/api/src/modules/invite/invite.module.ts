import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { InviteRepository } from './invite.repository';
import { MembershipRepository } from '../membership/membership.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InviteService, InviteRepository, MembershipRepository],
  controllers: [InviteController],
  exports: [InviteRepository, MembershipRepository],
})
export class InviteModule {}

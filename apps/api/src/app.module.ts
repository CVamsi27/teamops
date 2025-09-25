import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma.module';
import { TeamModule } from './modules/team/team.module';
import { TaskModule } from './modules/task/task.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './modules/invite/invite.module';
import { NotificationModule } from './modules/notification/notification.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    TeamModule,
    TaskModule,
    AuthModule,
    InviteModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

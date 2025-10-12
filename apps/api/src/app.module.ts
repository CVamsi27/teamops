import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma.module';
import { TeamModule } from './modules/team/team.module';
import { TaskModule } from './modules/task/task.module';
import { ProjectModule } from './modules/project/project.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './modules/invite/invite.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UserModule } from './modules/user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ChatModule } from './modules/chat/chat.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ResponseValidationInterceptor } from './common/response-validation.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    PrismaModule,
    TeamModule,
    TaskModule,
    ProjectModule,
    AuthModule,
    InviteModule,
    NotificationModule,
    UserModule,
    DashboardModule,
    IntegrationModule,
    ActivityModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseValidationInterceptor,
    },
  ],
})
export class AppModule {}

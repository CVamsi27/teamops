import { Module } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import { GoogleCalendarService } from './google-calendar.service';
import { PrismaModule } from '../../infrastructure/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationController],
  providers: [IntegrationService, GoogleCalendarService],
  exports: [IntegrationService, GoogleCalendarService],
})
export class IntegrationModule {}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';

@Injectable()
export class IntegrationService {
  constructor(private prisma: PrismaService) {}

  async getGoogleCalendarIntegration(_userId: string) {
    return null;
  }

  async getCalendarEvents(_userId: string) {
    return [];
  }

  async updateCalendarSettings(_userId: string, _settings: unknown) {
    throw new Error(
      'Calendar settings update not yet implemented. Database schema migration required.'
    );
  }

  async disconnectCalendar(_userId: string) {
    throw new Error(
      'Calendar disconnect not yet implemented. Database schema migration required.'
    );
  }

  async syncCalendar(_userId: string) {
    throw new Error(
      'Calendar sync not yet implemented. Database schema migration required.'
    );
  }
}

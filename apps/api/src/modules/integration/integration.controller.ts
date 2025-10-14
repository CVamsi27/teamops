import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { IntegrationService } from './integration.service';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../common/public.decorator';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('integrations')
export class IntegrationController {
  constructor(
    private integrationService: IntegrationService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  @Get('google-calendar')
  @UseGuards(JwtAuthGuard)
  async getGoogleCalendarIntegration(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.integrationService.getGoogleCalendarIntegration(userId);
  }

  @Get('google-calendar/status')
  @UseGuards(JwtAuthGuard)
  async getGoogleCalendarStatus(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.googleCalendarService.getConnectionStatus(userId);
  }

  @Post('google-calendar/disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnectGoogleCalendar(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.googleCalendarService.disconnectCalendar(userId);
  }

  @Post('google-calendar/refresh')
  @UseGuards(JwtAuthGuard)
  async refreshGoogleCalendar(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    try {
      const events = await this.googleCalendarService.syncEventsForUser(userId);
      return {
        success: true,
        events,
        message: 'Calendar events refreshed successfully',
      };
    } catch (_error) {
      return {
        success: false,
        message:
          _error instanceof Error ? _error.message : 'Failed to refresh calendar',
      };
    }
  }

  @Get('google-calendar/events')
  @UseGuards(JwtAuthGuard)
  async getCalendarEvents(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.integrationService.getCalendarEvents(userId);
  }

  @Get('google-calendar/auth')
  @UseGuards(JwtAuthGuard)
  async initiateGoogleAuth(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    const authUrl = await this.googleCalendarService.getAuthUrl(userId);
    return { authUrl };
  }

  @Get('google-calendar/callback')
  @Public()
  async handleGoogleCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Res() res?: Response
  ) {
    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(
        `${frontendUrl}/integrations?error=missing_code&message=Authorization code is required`
      );
    }

    try {
      let userId: string;
      if (state) {
        try {
          userId = Buffer.from(state, 'base64').toString();
        } catch {
          const frontendUrl =
            process.env.FRONTEND_URL || 'http://localhost:3000';
          return res.redirect(
            `${frontendUrl}/integrations?error=invalid_state&message=Invalid state parameter`
          );
        }
      } else {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(
          `${frontendUrl}/integrations?error=missing_state&message=User context is required`
        );
      }

      const result = await this.googleCalendarService.handleCallback(
        code,
        userId
      );

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const params = new URLSearchParams({
        success: 'true',
        message: 'Google Calendar connected successfully',
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiryDate: result.expiryDate.toString(),
      });

      return res.redirect(`${frontendUrl}/integrations?${params.toString()}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return res.redirect(
        `${frontendUrl}/integrations?error=oauth_failed&message=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  @Post('google-calendar/callback')
  @UseGuards(JwtAuthGuard)
  async handleGoogleCallbackPost(
    @Req() req: AuthenticatedRequest,
    @Body() body: { code: string }
  ) {
    const userId = req.user!.id || req.user!.userId;
    return await this.googleCalendarService.handleCallback(body.code, userId);
  }

  @Patch('google-calendar/settings')
  @UseGuards(JwtAuthGuard)
  async updateCalendarSettings(
    @Req() _req: AuthenticatedRequest,
    @Body() _settings: unknown
  ) {
    const userId = _req.user!.id || _req.user!.userId;
    return await this.integrationService.updateCalendarSettings(
      userId,
      _settings as any,
    );
  }

  @Post('google-calendar/disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnectCalendar(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.integrationService.disconnectCalendar(userId);
  }

  @Post('google-calendar/sync')
  @UseGuards(JwtAuthGuard)
  async syncCalendar(@Req() req: AuthenticatedRequest) {
    const userId = req.user!.id || req.user!.userId;
    return await this.integrationService.syncCalendar(userId);
  }

  @Post('google-calendar/sync-tasks-projects')
  @UseGuards(JwtAuthGuard)
  async syncTasksAndProjects(
    @Req() _req: AuthenticatedRequest,
    @Body() _body: { accessToken: string; refreshToken: string }
  ) {
    const userId = _req.user!.id || _req.user!.userId;
    return await this.googleCalendarService.syncUserTasksAndProjects(userId);
  }

  @Post('google-calendar/sync-task')
  @UseGuards(JwtAuthGuard)
  async syncTask(
    @Req() _req: AuthenticatedRequest,
    @Body() body: { taskId: string; accessToken: string; refreshToken: string }
  ) {
    const userId = _req.user!.id || _req.user!.userId;
    return await this.googleCalendarService.syncTaskToCalendar(
      body.taskId,
      userId,
      body.accessToken,
      body.refreshToken
    );
  }

  @Post('google-calendar/sync-project')
  @UseGuards(JwtAuthGuard)
  async syncProject(
    @Req() _req: AuthenticatedRequest,
    @Body()
    body: { projectId: string; accessToken: string; refreshToken: string }
  ) {
    const userId = _req.user!.id || _req.user!.userId;
    return await this.googleCalendarService.syncProjectToCalendar(
      body.projectId,
      userId,
      body.accessToken,
      body.refreshToken
    );
  }
}

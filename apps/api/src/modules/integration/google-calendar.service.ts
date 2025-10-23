import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../infrastructure/prisma.service';

interface CalendarEvent {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  reminderMinutes?: number;
}

@Injectable()
export class GoogleCalendarService {
  private oauth2Client;

  constructor(private prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_API_URL}/integrations/google-calendar/callback`
    );
  }

  async getAuthUrl(userId?: string): Promise<string> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId ? Buffer.from(userId).toString('base64') : undefined,
    });

    return authUrl;
  }

  async getConnectionStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleCalendarToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleCalendarToken || !user?.googleRefreshToken) {
      return {
        connected: false,
        message: 'Google Calendar not connected',
      };
    }

    const isExpired =
      user.googleTokenExpiry && new Date() > user.googleTokenExpiry;

    return {
      connected: true,
      hasValidToken: !isExpired,
      expiryDate: user.googleTokenExpiry,
      message: isExpired
        ? 'Google Calendar connected but token expired. Reconnection may be required.'
        : 'Google Calendar connected successfully',
    };
  }

  async disconnectCalendar(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleCalendarToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Google Calendar disconnected successfully',
    };
  }

  async getUserTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleCalendarToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user?.googleCalendarToken || !user?.googleRefreshToken) {
      throw new Error('No Google Calendar tokens found for user');
    }

    return {
      accessToken: user.googleCalendarToken,
      refreshToken: user.googleRefreshToken,
      expiryDate: user.googleTokenExpiry,
    };
  }

  async syncEventsForUser(userId: string) {
    const tokens = await this.getUserTokens(userId);
    return this.syncEvents(userId, tokens.accessToken, tokens.refreshToken);
  }

  async handleCallback(code: string, userId: string) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          googleCalendarToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
        },
      });

      return {
        success: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        message:
          'Google Calendar connected successfully. You can now sync tasks and projects.',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to exchange code for tokens: ${message}`);
    }
  }

  async syncEvents(userId: string, accessToken: string, refreshToken: string) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const now = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync events: ${message}`);
    }
  }

  async createEvent(
    userId: string,
    event: CalendarEvent,
    accessToken: string,
    refreshToken: string
  ) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const calendarEvent = {
        summary: event.title,
        description: event.description || '',
        start: {
          dateTime: event.startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endTime,
          timeZone: 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: event.reminderMinutes || 15 },
            { method: 'popup', minutes: event.reminderMinutes || 15 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create event: ${message}`);
    }
  }

  async updateEvent(
    eventId: string,
    event: CalendarEvent,
    accessToken: string,
    refreshToken: string
  ) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const calendarEvent = {
        summary: event.title,
        description: event.description || '',
        start: {
          dateTime: event.startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endTime,
          timeZone: 'UTC',
        },
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: calendarEvent,
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update event: ${message}`);
    }
  }

  async deleteEvent(
    eventId: string,
    accessToken: string,
    refreshToken: string
  ) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      );
    }

    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete event: ${message}`);
    }
  }

  async syncUserTasksAndProjects(userId: string) {
    try {
      const tasks = await this.prisma.task.findMany({
        where: {
          assigneeId: userId,
          dueDate: { not: null },
        },
        include: {
          project: true,
        },
      });

      const memberships = await this.prisma.membership.findMany({
        where: { userId },
        include: {
          team: {
            include: {
              projects: true,
            },
          },
        },
      });

      const projects = memberships.flatMap(
        (membership) => membership.team.projects
      );

      const results = {
        syncedTasks: 0,
        syncedProjects: 0,
        errors: [],
      };

      return {
        success: true,
        message: `Ready to sync ${tasks.length} tasks and ${projects.length} projects to Google Calendar`,
        details: results,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync tasks and projects: ${message}`);
    }
  }

  async syncTaskToCalendar(
    taskId: string,
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          project: true,
          assignee: true,
        },
      });

      if (!task || !task.dueDate) {
        throw new Error('Task not found or has no due date');
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error(
          'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
        );
      }

      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const eventStartTime = new Date(task.dueDate);
      eventStartTime.setHours(eventStartTime.getHours() - 1);

      const calendarEvent = {
        summary: `📋 Task Due: ${task.title}`,
        description: `Task: ${task.title}\nProject: ${task.project.name}\nStatus: ${task.status}\nPriority: ${task.priority}\n\nDescription: ${task.description || 'No description'}`,
        start: {
          dateTime: eventStartTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: task.dueDate.toISOString(),
          timeZone: 'UTC',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
        colorId: this.getTaskPriorityColor(task.priority),
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });

      return {
        success: true,
        eventId: response.data.id,
        message: `Task "${task.title}" synced to Google Calendar`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync task to calendar: ${message}`);
    }
  }

  async syncProjectToCalendar(
    projectId: string,
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          team: true,
          tasks: true,
        },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error(
          'Google Calendar credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
        );
      }

      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const projectDeadline = new Date();
      projectDeadline.setDate(projectDeadline.getDate() + 30);

      const calendarEvent = {
        summary: `🎯 Project Deadline: ${project.name}`,
        description: `Project: ${project.name}\nTeam: ${project.team.name}\nTasks: ${project.tasks.length}\n\nDescription: ${project.description || 'No description'}`,
        start: {
          date: projectDeadline.toISOString().split('T')[0],
        },
        end: {
          date: projectDeadline.toISOString().split('T')[0],
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 2880 },
            { method: 'popup', minutes: 1440 },
          ],
        },
        colorId: '9', // Blue color for projects
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      });

      return {
        success: true,
        eventId: response.data.id,
        message: `Project "${project.name}" deadline synced to Google Calendar`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync project to calendar: ${message}`);
    }
  }

  private getTaskPriorityColor(priority: string): string {
    const colorMap = {
      P1: '11', // Red - Highest priority
      P2: '6', // Orange - High priority
      P3: '3', // Purple - Medium priority
      P4: '10', // Green - Low priority
      P5: '8', // Gray - Lowest priority
    };
    return colorMap[priority] || '1'; // Default to blue
  }
}

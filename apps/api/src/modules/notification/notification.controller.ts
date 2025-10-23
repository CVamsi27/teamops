import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { CreateNotification } from '@workspace/api';

interface AuthRequest {
  user: {
    id: string;
    userId?: string;
    email?: string;
    role?: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Request() req: AuthRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unread') unread?: string
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const unreadOnly = unread === 'true';

    const result = await this.notificationService.findAllForUser(
      userId,
      pageNum,
      limitNum,
      unreadOnly
    );

    if (!page && !limit) {
      return result.data;
    }

    return result;
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.notificationService.getUnreadCount(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.notificationService.findOne(id, userId);
  }

  @Post()
  async create(
    @Body() createNotificationDto: CreateNotification,
    @Request() req: AuthRequest
  ) {
    return this.notificationService.createFromApi({
      ...createNotificationDto,
      userId: createNotificationDto.userId || req.user.id,
    });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: Record<string, unknown>,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    return this.notificationService.update(id, updateNotificationDto, userId);
  }
}

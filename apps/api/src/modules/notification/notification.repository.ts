import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { Notification as PrismaNotification } from '@prisma/client';
import type { Notification, CreateNotification, UpdateNotification } from '@workspace/api';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(this.map);
  }

  async findManyForUser(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(unreadOnly && { read: false }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications.map(this.map),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.map(notification) : null;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.findOne(id);
  }

  async create(payload: CreateNotification): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data ? JSON.parse(JSON.stringify(payload.data)) : null,
        userId: payload.userId,
        read: payload.read || false,
      },
    });
    return this.map(notification);
  }

  async update(id: string, payload: UpdateNotification): Promise<Notification | null> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: payload,
      });
      return this.map(notification);
    } catch {
      return null;
    }
  }

  async markAsRead(id: string): Promise<Notification | null> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return this.map(notification);
    } catch {
      return null;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async markAllAsReadForUser(userId: string): Promise<void> {
    await this.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.notification.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private map(n: PrismaNotification): Notification {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data as Record<string, unknown> | undefined,
      userId: n.userId,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    };
  }
}
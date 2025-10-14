import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { ChatMessage, CreateChatMessage } from '@workspace/api';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateChatMessage): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        content: payload.content,
        roomId: payload.roomId,
        roomType: payload.roomType,
        messageType: payload.messageType,
        userId: payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
      },
    });
    return this.map(message);
  }

  async findByRoom(
    roomId: string,
    roomType: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        roomId,
        roomType: roomType as any,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return messages.reverse().map(this.map);
  }

  async countByRoom(roomId: string, roomType: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        roomId,
        roomType: roomType as any,
      },
    });
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  private map(message: any): ChatMessage {
    return {
      id: message.id,
      content: message.content,
      roomId: message.roomId,
      roomType: message.roomType,
      messageType: message.messageType,
      userId: message.userId,
      userName: message.userName,
      userEmail: message.userEmail,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}

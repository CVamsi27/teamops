import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import type { ChatMessage, CreateChatMessage, ChatRoomType, ChatMessageType } from '@workspace/api';

type PrismaChatMessage = {
  id: string;
  content: string;
  roomId: string;
  roomType: string;
  messageType: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
};

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
    return this.map(message as unknown as PrismaChatMessage);
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
        roomType: roomType as ChatRoomType,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return messages.reverse().map((msg) => this.map(msg as unknown as PrismaChatMessage));
  }

  async countByRoom(roomId: string, roomType: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        roomId,
        roomType: roomType as ChatRoomType,
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

  private map(message: PrismaChatMessage): ChatMessage {
    return {
      id: message.id,
      content: message.content,
      roomId: message.roomId,
      roomType: message.roomType as ChatRoomType,
      messageType: message.messageType as ChatMessageType,
      userId: message.userId,
      userName: message.userName,
      userEmail: message.userEmail,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}

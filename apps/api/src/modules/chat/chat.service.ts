import { Injectable, Logger } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import type {
  ChatMessage,
  CreateChatMessage,
  ChatRoomType,
  ChatMessageType,
} from '@workspace/api';

interface ChatGateway {
  broadcastToRoom(roomId: string, roomType: string, event: string, data: unknown): void;
  getOnlineUsers(roomId: string, roomType: string): string[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private chatGateway: ChatGateway | null = null;

  constructor(private chatRepository: ChatRepository) {}

  setChatGateway(gateway: ChatGateway) {
    this.chatGateway = gateway;
  }

  async createMessage(payload: CreateChatMessage): Promise<ChatMessage> {
    try {
      const message = await this.chatRepository.create(payload);
      this.logger.log(
        `Message created: ${message.id} in room ${payload.roomId}`
      );
      return message;
    } catch (error) {
      this.logger.error('Error creating message:', error);
      throw error;
    }
  }

  async getChatHistory(
    roomId: string,
    roomType: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const messages = await this.chatRepository.findByRoom(
        roomId,
        roomType,
        limit,
        offset
      );
      return messages;
    } catch (error) {
      this.logger.error('Error getting chat history:', error);
      throw error;
    }
  }

  async getRoomMessageCount(roomId: string, roomType: string): Promise<number> {
    try {
      return await this.chatRepository.countByRoom(roomId, roomType);
    } catch (error) {
      this.logger.error('Error getting room message count:', error);
      throw error;
    }
  }

  async createSystemMessage(
    roomId: string,
    roomType: ChatRoomType,
    content: string,
    _triggerUserId?: string
  ): Promise<ChatMessage> {
    const systemMessage: CreateChatMessage = {
      content,
      roomId,
      roomType,
      messageType: 'SYSTEM' as ChatMessageType,
      userId: 'system',
      userName: 'System',
      userEmail: 'system@teamops.com',
    };

    const message = await this.createMessage(systemMessage);

    if (this.chatGateway) {
      this.chatGateway.broadcastToRoom(roomId, roomType, 'new_message', message);
    }

    return message;
  }

  async getOnlineUsers(roomId: string, roomType: string): Promise<string[]> {
    if (!this.chatGateway) {
      return [];
    }
    return this.chatGateway.getOnlineUsers(roomId, roomType);
  }

  async broadcastToRoom(
    roomId: string,
    roomType: string,
    event: string,
    data: unknown
  ): Promise<void> {
    if (this.chatGateway) {
      this.chatGateway.broadcastToRoom(roomId, roomType, event, data);
    }
  }

  async cleanupOldMessages(days: number = 90): Promise<number> {
    try {
      const deletedCount = await this.chatRepository.deleteOlderThan(days);
      this.logger.log(`Cleaned up ${deletedCount} old chat messages`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up old messages:', error);
      throw error;
    }
  }
}

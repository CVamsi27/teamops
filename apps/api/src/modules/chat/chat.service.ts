import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import {
  extractMentions,
  createMentionNotifications,
} from './utils/mention-parser';
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

interface NotificationService {
  createFromApi(data: any): Promise<any>;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private chatGateway: ChatGateway | null = null;

  constructor(
    private chatRepository: ChatRepository,
    @Optional()
    @Inject('NotificationService')
    private notificationService?: NotificationService
  ) {}

  setChatGateway(gateway: ChatGateway) {
    this.chatGateway = gateway;
  }

  async createMessage(payload: CreateChatMessage): Promise<ChatMessage> {
    try {
      const message = await this.chatRepository.create(payload);
      this.logger.log(
        `Message created: ${message.id} in room ${payload.roomId}`
      );

      // Process mentions if message is not a system message
      if (payload.messageType !== 'SYSTEM' && this.notificationService) {
        await this.processMentions(
          message,
          payload.content,
          payload.userName,
          payload.roomId,
          payload.roomType
        );
      }

      return message;
    } catch (error) {
      this.logger.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Processes @mentions in a chat message and creates notifications
   */
  private async processMentions(
    message: ChatMessage,
    content: string,
    authorName: string,
    roomId: string,
    roomType: ChatRoomType
  ): Promise<void> {
    try {
      // Extract mentions from content
      const mentions = extractMentions(content);

      if (mentions.length === 0) {
        return;
      }

      this.logger.debug(`Found ${mentions.length} mentions in message ${message.id}`);

      // Note: In a real implementation, you would fetch team members from the repository
      // For now, we create notifications for valid mentions
      // This would need to be enhanced with actual user lookup

      const notificationData = createMentionNotifications(
        mentions.map(m => ({
          userId: m, // In real impl, this would be looked up
          userName: m,
          userEmail: `${m}@teamops.local`, // Placeholder
        })),
        message.id,
        authorName,
        roomId,
        roomType as string
      );

      // Create notifications for each mentioned user
      for (const notification of notificationData) {
        try {
          if (this.notificationService) {
            await this.notificationService.createFromApi({
              userId: notification.userId,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              data: notification.data,
              read: false,
            });

            this.logger.log(
              `Mention notification created for user ${notification.userId} in message ${message.id}`
            );
          }
        } catch (err) {
          const error = err as Error;
          this.logger.warn(
            `Failed to create mention notification for user ${notification.userId}: ${error.message}`
          );
          // Continue processing other mentions even if one fails
        }
      }
    } catch (error) {
      const err = error as Error;
      this.logger.warn(
        `Error processing mentions in message ${message.id}: ${err.message}`
      );
      // Don't throw - mention processing should not break message creation
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

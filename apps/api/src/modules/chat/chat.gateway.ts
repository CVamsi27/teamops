import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { GetChatHistoryDto } from './dto/get-chat-history.dto';
import type { ChatMessage } from '@workspace/api';

interface SocketWithUser extends Socket {
  userId?: string;
  userName?: string;
  userRooms?: Set<string>;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);
  private activeUsers = new Map<string, SocketWithUser>(); // userId -> socket
  private roomUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>

  constructor(private chatService: ChatService) {
    this.chatService.setChatGateway(this);
  }

  async handleConnection(client: SocketWithUser) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: SocketWithUser) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      if (client.userRooms) {
        for (const roomKey of client.userRooms) {
          await this.leaveRoom(client, roomKey);
        }
      }

      this.activeUsers.delete(client.userId);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() data: JoinRoomDto
  ) {
    try {
      const { roomId, roomType, userId, userName } = data;
      const roomKey = `${roomType.toLowerCase()}_${roomId}`;

      client.userId = userId;
      client.userName = userName;
      client.userRooms = client.userRooms || new Set();
      client.userRooms.add(roomKey);

      await client.join(roomKey);

      this.activeUsers.set(userId, client);

      if (!this.roomUsers.has(roomKey)) {
        this.roomUsers.set(roomKey, new Set());
      }
      this.roomUsers.get(roomKey)!.add(userId);

      client.to(roomKey).emit('user_joined', {
        userId,
        userName,
      });

      const onlineUsers = Array.from(this.roomUsers.get(roomKey) || []);
      client.emit('online_users', onlineUsers);

      this.server.to(roomKey).emit('online_users', onlineUsers);

      this.logger.log(`User ${userName} joined room ${roomKey}`);
    } catch (error) {
      this.logger.error('Error joining chat:', error);
      client.emit('error', { message: 'Failed to join chat room' });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() data: { roomId: string; roomType: string; userId: string }
  ) {
    try {
      const roomKey = `${data.roomType.toLowerCase()}_${data.roomId}`;
      await this.leaveRoom(client, roomKey);
    } catch (error) {
      this.logger.error('Error leaving chat:', error);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody()
    data: { roomId: string; roomType: string; message: Omit<ChatMessage, 'id'> }
  ) {
    try {
      const { roomId, roomType, message } = data;
      const roomKey = `${roomType.toLowerCase()}_${roomId}`;

      const savedMessage = await this.chatService.createMessage({
        content: message.content,
        roomId,
        roomType: roomType.toUpperCase() as 'TEAM' | 'TASK',
        messageType: 'MESSAGE',
        userId: message.userId,
        userName: message.userName,
        userEmail: message.userEmail,
      });

      this.server.to(roomKey).emit('new_message', savedMessage);

      this.logger.log(`Message sent to room ${roomKey} by ${message.userName}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('get_chat_history')
  async handleGetChatHistory(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() data: GetChatHistoryDto
  ) {
    try {
      const { roomId, roomType, limit = 50, offset = 0 } = data;

      const messages = await this.chatService.getChatHistory(
        roomId,
        roomType.toUpperCase(),
        limit,
        offset
      );

      client.emit('chat_history', messages);
    } catch (error) {
      this.logger.error('Error getting chat history:', error);
      client.emit('error', { message: 'Failed to get chat history' });
    }
  }

  private async leaveRoom(client: SocketWithUser, roomKey: string) {
    if (!client.userId || !client.userName) return;

    await client.leave(roomKey);

    if (client.userRooms) {
      client.userRooms.delete(roomKey);
    }

    if (this.roomUsers.has(roomKey)) {
      this.roomUsers.get(roomKey)!.delete(client.userId);

      if (this.roomUsers.get(roomKey)!.size === 0) {
        this.roomUsers.delete(roomKey);
      }
    }

    client.to(roomKey).emit('user_left', {
      userId: client.userId,
      userName: client.userName,
    });

    const onlineUsers = Array.from(this.roomUsers.get(roomKey) || []);
    this.server.to(roomKey).emit('online_users', onlineUsers);

    this.logger.log(`User ${client.userName} left room ${roomKey}`);
  }

  public broadcastToRoom(
    roomId: string,
    roomType: string,
    event: string,
    data: unknown
  ) {
    const roomKey = `${roomType.toLowerCase()}_${roomId}`;
    this.server.to(roomKey).emit(event, data);
  }

  public getOnlineUsers(roomId: string, roomType: string): string[] {
    const roomKey = `${roomType.toLowerCase()}_${roomId}`;
    return Array.from(this.roomUsers.get(roomKey) || []);
  }
}

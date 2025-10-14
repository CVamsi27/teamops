import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetChatHistoryDto } from './dto/get-chat-history.dto';
import type { ChatMessage, CreateChatMessage } from '@workspace/api';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getChatHistory(
    @Query() query: GetChatHistoryDto,
    @Request() _req: any
  ): Promise<ChatMessage[]> {
    const { roomId, roomType, limit, offset } = query;

    return this.chatService.getChatHistory(roomId, roomType, limit, offset);
  }

  @Post('message')
  async createMessage(
    @Body()
    body: { content: string; roomId: string; roomType: 'TEAM' | 'TASK' },
    @Request() _req: any
  ): Promise<ChatMessage> {
    const user = _req.user;
    if (!user) {
      throw new Error('Unauthorized');
    }

    const messageData: CreateChatMessage = {
      content: body.content,
      roomId: body.roomId,
      roomType: body.roomType,
      messageType: 'MESSAGE',
      userId: user.sub,
      userName: user.name || user.email.split('@')[0] || 'Unknown',
      userEmail: user.email,
    };

    return this.chatService.createMessage(messageData);
  }

  @Get('rooms/:roomId/users')
  async getOnlineUsers(
    @Query('roomType') roomType: string,
    @Query('roomId') roomId: string,
    @Request() _req: any
  ): Promise<{ onlineUsers: string[] }> {
    const onlineUsers = await this.chatService.getOnlineUsers(roomId, roomType);
    return { onlineUsers };
  }

  @Get('rooms/:roomId/stats')
  async getRoomStats(
    @Query('roomType') roomType: string,
    @Query('roomId') roomId: string,
    @Request() _req: any
  ): Promise<{ messageCount: number; onlineUsers: string[] }> {
    const [messageCount, onlineUsers] = await Promise.all([
      this.chatService.getRoomMessageCount(roomId, roomType),
      this.chatService.getOnlineUsers(roomId, roomType),
    ]);

    return { messageCount, onlineUsers };
  }
}

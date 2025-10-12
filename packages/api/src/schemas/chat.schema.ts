import { z } from 'zod';
import { ID, ISODateString, TimestampFields } from './common';

export const ChatRoomType = z.enum(['TEAM', 'TASK']);
export const ChatMessageType = z.enum(['MESSAGE', 'SYSTEM']);

export const CreateChatMessageSchema = z
  .object({
    content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
    roomId: ID,
    roomType: ChatRoomType,
    messageType: ChatMessageType.default('MESSAGE'),
    userId: ID,
    userName: z.string(),
    userEmail: z.string().email(),
  })
  .strict();

export const ChatMessageSchema = CreateChatMessageSchema.extend({
  id: ID,
  ...TimestampFields,
}).strict();

export const SendMessageSchema = z
  .object({
    content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
    roomId: ID,
    roomType: ChatRoomType,
  })
  .strict();

export const JoinChatRoomSchema = z
  .object({
    roomId: ID,
    roomType: ChatRoomType,
    userId: ID,
    userName: z.string(),
  })
  .strict();

export const LeaveChatRoomSchema = z
  .object({
    roomId: ID,
    userId: ID,
  })
  .strict();

export const GetChatHistorySchema = z
  .object({
    roomId: ID,
    roomType: ChatRoomType,
    limit: z.number().min(1).max(100).optional().default(50),
    offset: z.number().min(0).optional().default(0),
  })
  .strict();

export const ChatRoomInfoSchema = z
  .object({
    roomId: ID,
    roomType: ChatRoomType,
    roomName: z.string(),
    onlineUsers: z.array(z.string()),
    messageCount: z.number().optional(),
  })
  .strict();

export type ChatRoomType = z.infer<typeof ChatRoomType>;
export type ChatMessageType = z.infer<typeof ChatMessageType>;
export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendMessage = z.infer<typeof SendMessageSchema>;
export type JoinChatRoom = z.infer<typeof JoinChatRoomSchema>;
export type LeaveChatRoom = z.infer<typeof LeaveChatRoomSchema>;
export type GetChatHistory = z.infer<typeof GetChatHistorySchema>;
export type ChatRoomInfo = z.infer<typeof ChatRoomInfoSchema>;
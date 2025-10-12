import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ChatRepository,
    ChatService,
    ChatGateway,
  ],
  controllers: [ChatController],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import type { NotificationPayload } from '@workspace/api';

@WebSocketGateway({ cors: { origin: true } })
@Injectable()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(NotificationGateway.name);

  broadcast(topic: string, payload: unknown) {
    this.logger.log(`broadcast ${topic}`);
    this.server.emit(topic, payload);
  }
}

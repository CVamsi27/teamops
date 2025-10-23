import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);

          const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:9000',
          ];

          const isAllowed =
            allowedOrigins.includes(origin) ||
            /^http:\/\/localhost:\d+$/.test(origin);

          if (isAllowed) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        },
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
      allowEIO3: true,
      transports: ['websocket', 'polling'],
    });

    return server;
  }
}

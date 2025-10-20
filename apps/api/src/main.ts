import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SocketIoAdapter } from './infrastructure/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');

  app.useWebSocketAdapter(new SocketIoAdapter(app));

  app.use(cookieParser());

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:9000',
        'https://teamops-web.onrender.com', // Explicit production frontend URL
      ];

      console.log(`[CORS] Checking origin: ${origin}`);
      console.log(`[CORS] FRONTEND_URL: ${process.env.FRONTEND_URL}`);
      console.log(`[CORS] Allowed origins:`, allowedOrigins);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin || '') ||
        /\.onrender\.com$/.test(origin || ''); // Allow all onrender.com subdomains

      console.log(`[CORS] Origin ${origin} allowed: ${isAllowed}`);

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`[CORS] Origin ${origin} blocked by CORS policy`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Credentials'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
void bootstrap();

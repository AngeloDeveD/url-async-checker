import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем CORS для работы с фронтендом
  app.enableCors();

  // Глобальный префикс /api для всех маршрутов
  app.setGlobalPrefix('api');

  // Автоматическая валидация DTO через class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`🚀 NestJS Server running on http://localhost:${PORT}/api`);
}

bootstrap();
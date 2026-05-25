// src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import multipart from '@fastify/multipart';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  // Register multipart with increased limits for larger files
  await app.register(multipart, {
    limits: {
      fieldNameSize: 200,           
      fieldSize: 10 * 1024 * 1024,  
      fields: Infinity,             
      fileSize: 50 * 1024 * 1024,   
      files: Infinity,              
      headerPairs: 2000,            
      parts: Infinity   
    },
  });

  // Register static file serving — root matches UPLOADS_PATH from .env
  const uploadsPath = configService.get<string>('UPLOADS_PATH', '/var/www/uploads');
  const absoluteUploadsPath = path.resolve(uploadsPath);
  await app.register(require('@fastify/static'), {
    root: absoluteUploadsPath,
    prefix: '/',
  });

  // Setup global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS if needed
  app.enableCors({
    origin: ['https://ysumalaysia.org', 'https://www.ysumalaysia.org', 'http://localhost:4200'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await app.listen(3333, '0.0.0.0');
  console.log('Application is running on: http://localhost:3333');
  console.log('Static files are served by nginx from: /var/www/uploads/assets/');
}
bootstrap();

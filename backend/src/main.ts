// src/main.ts - Remove static file serving since nginx handles it now
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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

  // Register static file serving 
  await app.register(require('@fastify/static'), {
    root: '/var/www/uploads',
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

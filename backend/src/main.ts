import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecurityMiddleware, InputValidationService } from './security';
const cookieParser = require('cookie-parser');
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply security middleware
  app.use(cookieParser());
  app.use(compression()); // Compress responses
  
  // Initialize and apply security middleware
  const securityMiddleware = new SecurityMiddleware();
  app.use(securityMiddleware.use.bind(securityMiddleware));
  
  // Initialize and apply validation pipe
  const validationService = new InputValidationService();
  app.useGlobalPipes(validationService.getValidationPipe());
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  });
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Bahçeşehir University Library API')
    .setDescription('API documentation for the library reservation system')
    .setVersion('1.0')
    .addTag('library')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Start server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();

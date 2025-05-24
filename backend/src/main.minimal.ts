import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppSimpleModule } from './app.simple.module';

async function bootstrap() {
  try {
    console.log('🚀 Starting simplified NestJS application...');
    
    // Create the app with CORS enabled
    const app = await NestFactory.create(AppSimpleModule, { 
      logger: ['error', 'warn', 'log']
    });
    
    // Configure CORS to allow all origins in development
    app.enableCors({
      origin: true, // Allow all origins in development
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    
    // Set global prefix
    app.setGlobalPrefix('api');

    // Setup Swagger
    const config = new DocumentBuilder()
      .setTitle('Library Reservation System API')
      .setDescription('API for managing library reservations')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    // Use type assertion to resolve versioning conflicts
    const document = SwaggerModule.createDocument(app as any, config);
    SwaggerModule.setup('api/docs', app as any, document);
    
    // Get port from environment or use default 3000
    const port = process.env.PORT || 3000;
    
    // Start listening
    await app.listen(port);
    
    console.log(`✅ Server running on: http://localhost:${port}/api`);
    console.log('📌 Try these endpoints:');
    console.log(`   - GET http://localhost:${port}/api/health`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

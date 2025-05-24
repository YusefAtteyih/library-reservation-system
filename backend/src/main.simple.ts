import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting NestJS application...');
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS for development
    app.enableCors();
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    
    console.log(`✅ Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
  } catch (error) {
    console.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();

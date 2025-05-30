import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check if the API is running' })
  checkHealth() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is up and running! 🚀'
    };
  }
}

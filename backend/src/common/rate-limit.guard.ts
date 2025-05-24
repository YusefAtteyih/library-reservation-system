import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';
import { logger } from '../logging/logging.middleware';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected errorMessage = 'Rate limit exceeded';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { ip, method, originalUrl } = request;
    const userId = request.user?.id || 'anonymous';

    try {
      const result = await super.canActivate(context);
      
      if (!result) {
        logger.warn(`Rate limit exceeded`, {
          ip,
          userId,
          method,
          url: originalUrl
        });
      }
      
      return result;
    } catch (error) {
      logger.error(`Error in rate limiting`, {
        ip,
        userId,
        method,
        url: originalUrl,
        error: error.message
      });
      
      throw error;
    }
  }
}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { InputValidationService } from './input-validation.service';
import { AuthSecurityService } from './auth-security.service';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { RateLimitGuard } from './rate-limit.guard';
import { SecurityMiddleware } from './security.middleware';

@Module({
  imports: [
    ConfigModule,
  ],
  providers: [
    InputValidationService,
    AuthSecurityService,
    TwoFactorAuthService,
    SecurityMiddleware,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [
    InputValidationService,
    AuthSecurityService,
    TwoFactorAuthService,
    SecurityMiddleware,
  ],
})
export class SecurityModule {}

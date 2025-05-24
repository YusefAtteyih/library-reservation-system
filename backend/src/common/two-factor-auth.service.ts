import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFactorAuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new 2FA secret for a user
   */
  async generateSecret(userId: string): Promise<{ secret: string; otpAuthUrl: string }> {
    // Get user information
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      throw new Error('User not found or user email is missing');
    }

    // Generate a secret
    const secret = new OTPAuth.Secret().base32;

    // Create a new TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: 'Bahçeşehir Library',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Generate the OTP Auth URL
    const otpAuthUrl = totp.toString();

    // Store the secret in the database (encrypted in a real app)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false, // Not enabled until verified
      },
    });

    return { secret, otpAuthUrl };
  }

  /**
   * Verify a 2FA token and enable 2FA if valid
   */
  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new Error('User not found or 2FA not set up');
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (isValid) {
      // Enable 2FA for the user
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
        },
      });
    }

    return isValid;
  }

  /**
   * Validate a 2FA token during login
   */
  async validateToken(user: User, token: string): Promise<boolean> {
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return true; // 2FA not enabled, consider it valid
    }

    return authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });
  }

  /**
   * Disable 2FA for a user
   */
  async disable(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });
  }
}

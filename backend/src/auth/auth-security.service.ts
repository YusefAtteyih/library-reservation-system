import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthSecurityService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate a secure JWT token
   * @param payload Data to encode in the token
   * @param expiresIn Token expiration time
   * @returns Signed JWT token
   */
  generateToken(payload: any, expiresIn: string = '1d'): string {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production';
    
    return jwt.sign(payload, secret, {
      expiresIn,
      audience: 'library-app',
      issuer: 'bahcesehir-university',
    });
  }

  /**
   * Verify and decode a JWT token
   * @param token JWT token to verify
   * @returns Decoded token payload or null if invalid
   */
  verifyToken(token: string): any | null {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production';
      
      return jwt.verify(token, secret, {
        audience: 'library-app',
        issuer: 'bahcesehir-university',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns Boolean indicating if password matches hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a secure random string
   * @param length Length of the string
   * @returns Random string
   */
  generateSecureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    
    // Use crypto.getRandomValues() for secure random generation
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i] % chars.length);
    }
    
    return result;
  }
}

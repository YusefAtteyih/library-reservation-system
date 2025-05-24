import { Injectable } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as validator from 'validator';

@Injectable()
export class InputValidationService {
  /**
   * Sanitize a string input to prevent XSS attacks
   * @param input String to sanitize
   * @returns Sanitized string
   */
  sanitizeString(input: string): string {
    if (!input) return '';
    return validator.escape(input.trim());
  }

  /**
   * Validate an email address
   * @param email Email to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    return validator.isEmail(email);
  }

  /**
   * Validate a URL
   * @param url URL to validate
   * @returns Boolean indicating if URL is valid
   */
  isValidUrl(url: string): boolean {
    return validator.isURL(url);
  }

  /**
   * Sanitize an object by escaping all string properties
   * @param obj Object to sanitize
   * @returns Sanitized object
   */
  sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const sanitized = { ...obj };
    
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeString(sanitized[key]);
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key]);
      }
    });
    
    return sanitized;
  }

  /**
   * Get a configured validation pipe for use in controllers
   * @returns ValidationPipe instance
   */
  getValidationPipe(): ValidationPipe {
    return new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTOs
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: false // Disable implicit type conversion
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed error messages in production
    });
  }
}

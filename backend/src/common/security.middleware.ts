import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as helmet from 'helmet';
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';
import * as hpp from 'hpp';

@Injectable()
export class SecurityMiddleware {
  private csrfProtection: any;
  private helmetMiddleware: any;
  private hppMiddleware: any;

  constructor() {
    // Initialize CSRF protection middleware
    this.csrfProtection = csurf({ 
      cookie: { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      } 
    });

    // Initialize Helmet middleware for security headers
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'wss:', 'ws:'],
        },
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'same-origin' },
    });

    // Initialize HPP middleware to prevent HTTP Parameter Pollution
    this.hppMiddleware = hpp();
  }

  // Apply Helmet middleware for security headers
  applyHelmet(req: Request, res: Response, next: NextFunction) {
    this.helmetMiddleware(req, res, next);
  }

  // Apply CSRF protection middleware
  applyCsrf(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for API endpoints that need to be accessed by external services
    if (req.path.startsWith('/api/webhook') || req.path.startsWith('/api/external')) {
      return next();
    }
    
    this.csrfProtection(req, res, next);
  }

  // Apply HPP middleware to prevent parameter pollution
  applyHpp(req: Request, res: Response, next: NextFunction) {
    this.hppMiddleware(req, res, next);
  }

  // Generate CSRF token and attach to response
  generateCsrfToken(req: Request, res: Response, next: NextFunction) {
    if (req.csrfToken) {
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false, // Client-side JavaScript needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
    next();
  }

  // Validate content type to prevent MIME type confusion attacks
  validateContentType(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        return res.status(415).json({ 
          statusCode: 415,
          message: 'Unsupported Media Type' 
        });
      }
    }
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import csrf from 'csurf';

// Extend Express Request type to include csrfToken
declare module 'express-serve-static-core' {
  interface Request {
    csrfToken?: () => string;
  }
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly csrfProtection = csrf({ cookie: true });

  use(req: Request, res: Response, next: NextFunction) {
    // Apply security middleware in the correct order
    this.applyHelmet(req, res, () => {
      this.applyHpp(req, res, () => {
        this.validateContentType(req, res, () => {
          this.applyCsrf(req, res, () => {
            this.generateCsrfToken(req, res, next);
          });
        });
      });
    });
  }

  private applyHelmet(req: Request, res: Response, next: NextFunction) {
    helmet()(req, res, next);
  }

  private applyHpp(req: Request, res: Response, next: NextFunction) {
    hpp()(req, res, next);
  }

  private validateContentType(req: Request, res: Response, next: NextFunction) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(415).json({
          statusCode: 415,
          message: 'Unsupported Media Type',
          error: 'Content-Type must be application/json',
        });
      }
    }
    next();
  }

  private applyCsrf(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for API routes and GET/HEAD/OPTIONS/TRACE methods
    if (req.path.startsWith('/api/') || ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(req.method)) {
      return next();
    }
    return this.csrfProtection(req, res, next);
  }

  private generateCsrfToken(req: Request, res: Response, next: NextFunction) {
    // Only set CSRF token if the method is not handled by CSRF protection
    if (req.method === 'GET' && req.path !== '/api/*') {
      // Generate a dummy token for GET requests that aren't API calls
      const token = Math.random().toString(36).substring(2);
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }
    next();
  }
}

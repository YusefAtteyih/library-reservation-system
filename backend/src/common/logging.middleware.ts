import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger: winston.Logger;

  constructor() {
    // Create a Winston logger instance with console and file transports
    const fileTransport = new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    });

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      )
    });

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [consoleTransport, fileTransport],
      exitOnError: false
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Get request details
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'];
    const userId = req['user']?.id || 'anonymous';

    // Log request
    this.logger.info(`Incoming request`, {
      method,
      url: originalUrl,
      ip,
      userAgent,
      userId
    });

    // Track response time
    const start = Date.now();

    // Log response when finished
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const { statusCode } = res;

      // Log based on status code
      if (statusCode >= 500) {
        this.logger.error(`Server error response`, {
          method,
          url: originalUrl,
          statusCode,
          responseTime,
          userId
        });
      } else if (statusCode >= 400) {
        this.logger.warn(`Client error response`, {
          method,
          url: originalUrl,
          statusCode,
          responseTime,
          userId
        });
      } else {
        this.logger.info(`Success response`, {
          method,
          url: originalUrl,
          statusCode,
          responseTime,
          userId
        });
      }
    });

    next();
  }
}

// Export a logger instance for use throughout the application
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'library-app' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      )
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

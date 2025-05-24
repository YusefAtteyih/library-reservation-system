import { Injectable, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class InputValidationService {
  getValidationPipe(): ValidationPipe {
    const options: ValidationPipeOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = this.flattenValidationErrors(errors);
        return new Error(messages.join('; '));
      },
    };
    return new ValidationPipe(options);
  }

  private flattenValidationErrors(
    validationErrors: ValidationError[],
    parentPath = '',
  ): string[] {
    const messages: string[] = [];
    
    for (const error of validationErrors) {
      const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;
      
      if (error.constraints) {
        messages.push(
          ...Object.values(error.constraints).map(
            (message) => `${propertyPath}: ${message}`,
          ),
        );
      }
      
      if (error.children?.length) {
        messages.push(
          ...this.flattenValidationErrors(error.children, propertyPath),
        );
      }
    }
    
    return messages;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZodType } from 'zod';
import { RESPONSE_SCHEMA_KEY } from './response-validation.decorator';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseSchema = this.reflector.getAllAndOverride<ZodType<any>>(
      RESPONSE_SCHEMA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!responseSchema) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        try {
          return responseSchema.parse(data);
        } catch (error: any) {
          console.error('Response validation failed:', {
            route: context.getHandler().name,
            error: error.issues || error.message,
            data,
          });
          
          // In development, throw the error. In production, log and return the data
          if (process.env.NODE_ENV === 'development') {
            throw new BadRequestException(
              `Response validation failed: ${error.message}`,
            );
          }
          
          return data;
        }
      }),
    );
  }
}
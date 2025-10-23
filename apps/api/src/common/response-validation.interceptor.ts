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
import { ZodError, ZodType } from 'zod';
import { RESPONSE_SCHEMA_KEY } from './response-validation.decorator';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const responseSchema = this.reflector.getAllAndOverride<ZodType<unknown>>(
      RESPONSE_SCHEMA_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!responseSchema) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        try {
          return responseSchema.parse(data);
        } catch (error) {
          const err = error as ZodError;
          console.error('Response validation failed:', {
            route: context.getHandler().name,
            error: err.issues || err.message,
            data,
          });

          if (process.env.NODE_ENV === 'development') {
            throw new BadRequestException(
              `Response validation failed: ${err.message}`
            );
          }

          return data;
        }
      })
    );
  }
}

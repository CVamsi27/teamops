import { SetMetadata, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ZodType } from 'zod';
import { ResponseValidationInterceptor } from './response-validation.interceptor';

export const RESPONSE_SCHEMA_KEY = 'response_schema';

export function ValidateResponse(schema: ZodType<any>) {
  return applyDecorators(
    SetMetadata(RESPONSE_SCHEMA_KEY, schema),
    UseInterceptors(ResponseValidationInterceptor),
  );
}
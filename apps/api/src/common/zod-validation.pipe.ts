import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodType, TypeOf } from 'zod';

@Injectable()
export class ZodValidationPipe<T extends ZodType<any>>
  implements PipeTransform
{
  constructor(private schema: T) {}

  transform(value: unknown): TypeOf<T> {
    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => {
        const path = i.path.length ? i.path.join('.') : '<root>';
        return `${path}: ${i.message}`;
      });

      throw new BadRequestException({
        message: 'Validation failed',
        details: issues,
      });
    }

    return parsed.data;
  }
}

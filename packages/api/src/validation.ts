import type { ZodType } from 'zod';

export class ValidationError extends Error {
  constructor(public details: string[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export function validateWithZod<T>(schema: ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => {
      const path = i.path.length ? i.path.join('.') : '<root>';
      return `${path}: ${i.message}`;
    });

    throw new ValidationError(issues);
  }

  return parsed.data;
}

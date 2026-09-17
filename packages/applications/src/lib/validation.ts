import type { ZodType } from 'zod';
import { ValidationError } from './error';

/** Shared safeParseAsync + ValidationError mapping used by every use case. */
export async function parseSchemaOrThrow<T>(
  schema: ZodType<T>,
  data: unknown,
  message = 'Validation error',
): Promise<T> {
  const parsed = await schema.safeParseAsync(data);
  if (!parsed.success) {
    throw new ValidationError(message, parsed.error.format());
  }
  return parsed.data;
}

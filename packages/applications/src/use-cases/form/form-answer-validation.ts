import type { FormField } from '@repo/domains/entities/form';
import {
  formAnswerValueSchema,
  formSelectConfigSchema,
} from '@repo/domains/schema/form';
import { ValidationError } from '../../lib/error';

export async function validateFormFieldConfig(
  field: Pick<FormField, 'type' | 'config'>,
) {
  if (field.type !== 'SELECT') return;
  const result = await formSelectConfigSchema.safeParseAsync(field.config);
  if (!result.success)
    throw new ValidationError(
      'SELECT requires unique, nonempty options',
      result.error,
    );
}

export async function validateFormAnswer(
  field: FormField,
  value: unknown,
  submitting = false,
) {
  const attachment = field.type === 'IMAGE' || field.type === 'FILE';
  const empty =
    value == null ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '');
  if (empty) {
    if (submitting && field.isRequired && !attachment)
      throw new ValidationError(
        `Required question "${field.label}" must be answered`,
      );
    return;
  }
  const result = await formAnswerValueSchema(field).safeParseAsync(value);
  if (!result.success)
    throw new ValidationError(
      `Invalid answer for "${field.label}"`,
      result.error,
    );
}

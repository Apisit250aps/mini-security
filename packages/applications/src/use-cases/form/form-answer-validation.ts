import type { FormField } from '@repo/domains/entities/form';
import { formAnswerValueSchema } from '@repo/domains/schema/form';
import { ValidationError } from '../../lib/error';

export async function validateFormFieldConfig(
  field: Pick<FormField, 'type'> & {
    options?: Array<{ label: string; value: string }>;
    config?: unknown;
  },
) {
  if (!['SELECT', 'RADIO', 'CHECKBOX_GROUP'].includes(field.type)) return;
  const legacyOptions =
    typeof field.config === 'object' && field.config !== null && 'options' in field.config
      ? (field.config as { options?: Array<{ label: string; value: string }> }).options
      : undefined;
  const options = field.options || legacyOptions || [];
  if (options.length === 0) return;

  const values = options.map((o) => o.value);
  if (new Set(values).size !== values.length) {
    throw new ValidationError('Option values must be unique');
  }
}

export async function validateFormAnswer(
  field: FormField & { config?: unknown },
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

  // Attachments must not have persisted non-null values in form_answer.value
  if (attachment) {
    throw new ValidationError(`Invalid answer for "${field.label}"`);
  }

  const legacyOptions =
    typeof field.config === 'object' && field.config !== null && 'options' in field.config
      ? (field.config as { options?: Array<{ label: string; value: string }> }).options
      : undefined;
  const normalizedField = {
    ...field,
    options: field.options || legacyOptions,
  };

  const result = await formAnswerValueSchema(normalizedField).safeParseAsync(value);
  if (!result.success)
    throw new ValidationError(
      `Invalid answer for "${field.label}"`,
      result.error,
    );
}

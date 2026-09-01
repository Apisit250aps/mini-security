import { core, util, z } from 'zod';
import { v7 as uuidv7 } from 'uuid';

type BaseFieldOptions<T> = {
  required?: boolean;
  nullable?: boolean;
  default?: util.NoUndefined<core.output<T>> | (() => T);
};

type FieldResult<
  TSchema extends z.ZodTypeAny,
  TRequired extends boolean,
  TNullable extends boolean,
> = TNullable extends true
  ? TRequired extends false
    ? z.ZodNullable<z.ZodOptional<TSchema>>
    : z.ZodNullable<TSchema>
  : TRequired extends false
    ? z.ZodOptional<TSchema>
    : TSchema;

type StringFieldOptions = BaseFieldOptions<string>;
type EmailFieldOptions = BaseFieldOptions<string>;
type UUIDFieldOptions = BaseFieldOptions<string>;
type NumberFieldOptions = BaseFieldOptions<number>;
type DateFieldOptions = BaseFieldOptions<Date>;
type BooleanFieldOptions = BaseFieldOptions<boolean>;

const createField = <
  TSchema extends z.ZodTypeAny,
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  schema: TSchema,
  options: BaseFieldOptions<z.input<TSchema>> & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
): FieldResult<TSchema, TRequired, TNullable> => {
  const { required = true as TRequired, nullable = false as TNullable } =
    options;
  let result: z.ZodTypeAny = schema;

  if (!required) {
    result = result.optional();
  }

  if (nullable) {
    result = result.nullable();
  }

  if (options.default !== undefined) {
    result = result.default(options.default).unwrap();
  }

  return result as FieldResult<TSchema, TRequired, TNullable>;
};

const StringField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: StringFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
    max?: number;
    min?: number;
  } = {},
) => {
  const base = z
    .string()
    .max(options.max ?? 255)
    .min(options.min ?? 0)
    .trim();
  const schema = options.required === false ? base : base.nonempty();
  return createField(schema, options);
};

const UUIDField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: UUIDFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.string().uuid(), options);
};

const EmailField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: EmailFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.string().email().trim().max(320), options);
};

const NumberField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: NumberFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.number(), options);
};

const DateField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: DateFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.date(), options);
};

const TimestampField = () => {
  return DateField({ default: () => new Date() });
};

const BooleanField = <
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  options: BooleanFieldOptions & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.boolean(), options);
};

const EnumField = <
  TValues extends readonly [string, ...string[]],
  TRequired extends boolean = true,
  TNullable extends boolean = false,
>(
  values: TValues,
  options: BaseFieldOptions<TValues[number]> & {
    required?: TRequired;
    nullable?: TNullable;
  } = {},
) => {
  return createField(z.enum(values), options);
};

const BaseEntity = <T extends z.ZodRawShape>(schema: T) => {
  return z.object({
    id: UUIDField({ default: () => uuidv7() }),
    ...schema,
    createdAt: TimestampField(),
    updatedAt: TimestampField(),
  });
};

export {
  BaseEntity,
  StringField,
  EmailField,
  UUIDField,
  NumberField,
  DateField,
  BooleanField,
  EnumField,
  TimestampField,
  uuidv7 as uuid,
};

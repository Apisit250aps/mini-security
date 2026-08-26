# Domain Layer Patterns & Code Templates

## 0. Core Abstractions (`src/index.ts`)

The root entry point exports the two base abstract classes that all other packages depend on:

```typescript
// packages/domains/src/index.ts
export abstract class BaseUseCase<Context, TOutput> {
  abstract execute(context: Context): Promise<TOutput>;
}

export abstract class BaseRepository<T, Create, Update> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(entity: Create): Promise<T>;
  abstract update(id: string, entity: Update): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

export * from './applications';
```

---

## 1. Zod Entity Builder (`lib/entity.ts`)

```typescript
// packages/domains/src/lib/entity.ts
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
  const { required = true as TRequired, nullable = false as TNullable } = options;
  let result: z.ZodTypeAny = schema;
  if (!required) result = result.optional();
  if (nullable) result = result.nullable();
  if (options.default !== undefined) result = result.default(options.default).unwrap();
  return result as FieldResult<TSchema, TRequired, TNullable>;
};

export const StringField = (options: any = {}) => {
  const base = z.string().max(options.max ?? 255).min(options.min ?? 0).trim();
  return createField(options.required === false ? base : base.nonempty(), options);
};

export const UUIDField = (options: any = {}) => createField(z.uuid(), options);
export const EmailField = (options: any = {}) => createField(z.email().trim().max(320), options);
export const NumberField = (options: any = {}) => createField(z.number(), options);
export const DateField = (options: any = {}) => createField(z.date(), options);
export const TimestampField = () => DateField({ default: () => new Date() });
export const BooleanField = (options: any = {}) => createField(z.boolean(), options);

export const BaseEntity = <T extends z.ZodRawShape>(schema: T) => {
  return z.object({
    id: UUIDField({ default: () => uuidv7() }),
    ...schema,
    createdAt: TimestampField(),
    updatedAt: TimestampField(),
  });
};
```

---

## 2. Entity Schema Definition (`schema/user.ts`)

```typescript
// packages/domains/src/schema/user.ts
import { z } from 'zod';
import { BaseEntity, BooleanField, DateField, EmailField, StringField } from '../lib/entity';

export const userSchema = BaseEntity({
  name: StringField({ required: true }),
  email: EmailField({ required: true }),
  emailVerified: BooleanField({ default: () => false }),
  image: StringField(),
  firstName: StringField(),
  lastName: StringField(),
  isActive: BooleanField({ default: true }),
  lastLogin: DateField({ nullable: true }),
});

export const createUserSchema = userSchema.omit({
  id: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserEntity = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

---

## 3. Entity Class Implementation (`entities/user.ts`)

```typescript
// packages/domains/src/entities/user.ts
import type { UserEntity } from '../schema/user';

export class User implements UserEntity {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.emailVerified = data.emailVerified;
    this.image = data.image;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.isActive = data.isActive;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

---

## 4. Repository Interface Contract (`repositories/user.repo.ts`)

```typescript
// packages/domains/src/repositories/user.repo.ts
import { BaseRepository } from '..';
import { User } from '../entities/user';
import { CreateUser, UpdateUser } from '../schema/user';

export interface IUserRepository extends BaseRepository<User, CreateUser, UpdateUser> {
  findByEmail(email: string): Promise<User | null>;
}
```

---

## 5. Use Case Interface & Context Types (`applications/users.usecase.ts`)

```typescript
// packages/domains/src/applications/users.usecase.ts
import { BaseUseCase } from '..';
import { User } from '../entities/user';
import { CreateUser, UpdateUser } from '../schema/user';

export type ICreateUserContext = { data: CreateUser };
export type IUpdateUserContext = { id: string; data: UpdateUser };
export type IDeleteUserContext = { id: string };
export type IGetUserContext = { id: string };
export type IGetUsersContext = { filter: Record<string, unknown> };

export type ICreateUserUseCase = BaseUseCase<ICreateUserContext, User>;
export type IUpdateUserUseCase = BaseUseCase<IUpdateUserContext, User>;
export type IDeleteUserUseCase = BaseUseCase<IDeleteUserContext, void>;
export type IGetUserUseCase = BaseUseCase<IGetUserContext, User | null>;
export type IGetUsersUseCase = BaseUseCase<IGetUsersContext, User[]>;
```

# Use Case Implementation Pattern (Clean Architecture)

This rule defines the strict pattern for defining and implementing Use Cases in this project. The architecture separates the definition (interfaces and types) in the `domains` package from the actual implementation in the `applications` package.

## 1. Domain Layer (`packages/domains/src/applications/`)
This is where the Use Case interfaces and Context types are defined.

**Rules:**
- Import the entity schema (e.g., `CreateUser`, `UpdateUser`) from `../schema`.
- Define Context types for each operation (`ICreate...Context`, `IUpdate...Context`, etc.).
- Define the Use Case type using `BaseUseCase<Context, Output>`.
- Export all the Context and Use Case types.

**Example (`packages/domains/src/applications/users.usecase.ts`):**
```typescript
import { BaseUseCase } from '..';
import { User } from '../entities/user';
import { CreateUser, UpdateUser } from '../schema/user';

type ICreateUserContext = { data: CreateUser };
type IUpdateUserContext = { id: string; data: UpdateUser };
type IDeleteUserContext = { id: string };
type IGetUserContext = { id: string };
type IGetUsersContext = { filter: Record<string, unknown> };

type ICreateUserUseCase = BaseUseCase<ICreateUserContext, User>;
type IUpdateUserUseCase = BaseUseCase<IUpdateUserContext, User>;
type IDeleteUserUseCase = BaseUseCase<IDeleteUserContext, void>;
type IGetUserUseCase = BaseUseCase<IGetUserContext, User | null>;
type IGetUsersUseCase = BaseUseCase<IGetUsersContext, User[]>;

export type {
  ICreateUserContext,
  IUpdateUserContext,
  IDeleteUserContext,
  IGetUserContext,
  IGetUsersContext,
  ICreateUserUseCase,
  IUpdateUserUseCase,
  IDeleteUserUseCase,
  IGetUserUseCase,
  IGetUsersUseCase,
};
```

## 2. Applications Layer (`packages/applications/src/use-cases/`)
This is where the Use Cases are implemented. 

**Rules:**
- Implement each Use Case as a class that implements the interface from `domains`.
- Inject the required Repository via the constructor.
- Use `safeParseAsync` from Zod schemas to validate `context.data` for Create/Update operations.
- Throw appropriate errors from `../lib/error` (e.g., `ValidationError`, `NotFoundError`, `DuplicateError`).
- Export the class directly.

**Example (`packages/applications/src/use-cases/user.usecase.ts`):**
```typescript
import {
  ICreateUserContext,
  ICreateUserUseCase,
} from '@shop/domains/applications/users';
import { User } from '@shop/domains/entities';
import { IUserRepository } from '@shop/domains/repositories/user';
import { createUserSchema } from '@shop/domains/schema/user';
import { ValidationError, NotFoundError } from '../lib/error';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: ICreateUserContext): Promise<User> {
    const parsed = await createUserSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid user data');
    }
    // Add any specific domain business logic here (e.g., duplicate checks)
    return this.userRepository.create(parsed.data);
  }
}
```

## 3. Repositories (`packages/domains/src/repositories/`)
Ensure the repository extends `BaseRepository` correctly with exactly 3 generic arguments: `Entity`, `CreatePayload`, `UpdatePayload`.

**Example:**
```typescript
import { BaseRepository } from '..';
import { User } from '../entities/user';
import { CreateUser, UpdateUser } from '../schema/user';

export interface IUserRepository extends BaseRepository<User, CreateUser, UpdateUser> {
  // Custom queries here
}
```

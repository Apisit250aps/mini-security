# Application Layer Patterns & Code Templates

## 1. Application Error Hierarchy & Response Wrapper (`lib/error.ts`)

```typescript
// packages/applications/src/lib/error.ts
export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: AppErrorCode,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class DuplicateError extends AppError {
  constructor(message = 'Duplicate') {
    super(message, 409, 'VALIDATION_ERROR');
    this.name = 'DuplicateError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, 'INTERNAL_ERROR');
    this.name = 'InternalError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export type ApiResponse<T> = {
  message: string;
  success: boolean;
  data?: T;
  error?: string;
  code?: AppErrorCode;
};

export const throwAppError = (error: unknown): never => {
  if (error instanceof AppError) throw error;
  throw new InternalError(error instanceof Error ? error.message : 'Unknown error');
};
```

---

## 2. Use Case Implementation (`use-cases/user.usecase.ts`)

```typescript
// packages/applications/src/use-cases/user.usecase.ts
import {
  ICreateUserContext,
  ICreateUserUseCase,
  IGetUserContext,
  IGetUserUseCase,
  IUpdateUserContext,
  IUpdateUserUseCase,
  IDeleteUserContext,
  IDeleteUserUseCase,
} from '@<project>/domains/applications/users';
import { User } from '@<project>/domains/entities';
import { IUserRepository } from '@<project>/domains/repositories/user';
import { createUserSchema, updateUserSchema } from '@<project>/domains/schema/user';
import { ValidationError, NotFoundError, DuplicateError } from '../lib/error';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: ICreateUserContext): Promise<User> {
    const parsed = await createUserSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid user data: ' + parsed.error.message);
    }

    // Invariant business check
    const existing = await this.userRepository.findByEmail(parsed.data.email);
    if (existing) {
      throw new DuplicateError('User with this email already exists.');
    }

    return this.userRepository.create(parsed.data);
  }
}

export class GetUserUseCase implements IGetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IGetUserContext): Promise<User | null> {
    const user = await this.userRepository.findById(context.id);
    if (!user) {
      throw new NotFoundError(`User with ID ${context.id} not found.`);
    }
    return user;
  }
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IUpdateUserContext): Promise<User> {
    // Check existence first
    const existingUser = await this.userRepository.findById(context.id);
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (context.data.email && context.data.email !== existingUser.email) {
      const emailInUse = await this.userRepository.findByEmail(context.data.email);
      if (emailInUse) throw new DuplicateError('Email is already in use by another user');
    }

    const parsed = await updateUserSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid update data');
    }
    return this.userRepository.update(context.id, parsed.data);
  }
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IDeleteUserContext): Promise<void> {
    const existingUser = await this.userRepository.findById(context.id);
    if (!existingUser) throw new NotFoundError('User not found');
    await this.userRepository.delete(context.id);
  }
}
```

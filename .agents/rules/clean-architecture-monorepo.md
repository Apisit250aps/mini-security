# Monorepo Clean Architecture Rules

This project strictly follows a Clean Architecture pattern separated by Turborepo workspaces (packages).
The dependency flow MUST strictly go from inner layers to outer layers as follows:

**`domains` -> `database` -> `applications` -> `infrastructures`**

## 1. Dependency Flow & Rules

### `packages/domains` (Inner-most Layer)
- **Role**: Contains Enterprise Business Rules (Entities, Repository Interfaces, Types, DTOs).
- **Dependencies**: Cannot depend on any other internal packages. Must have ZERO dependencies on `database`, `applications`, or `infrastructures`.
- **Allowed**: Pure TypeScript/JavaScript. No framework or database specific imports.

### `packages/database` 
- **Role**: Defines database schemas (e.g., Drizzle ORM schemas) and base repository abstractions.
- **Dependencies**: May depend on `domains` (e.g., for types) if necessary, but is largely independent.
- **Forbidden**: Cannot depend on `applications` or `infrastructures`.

### `packages/applications` 
- **Role**: Contains Application Business Rules (Use Cases, Services).
- **Dependencies**: Depends heavily on `domains` (for Entities and Repository Interfaces).
- **Forbidden**: Cannot depend on `infrastructures` or `database` directly. Cannot import concrete implementations of Repositories, external APIs, or Frameworks (e.g., Express, Next.js). Must use Dependency Injection.

### `packages/infrastructures` (Outer-most Layer)
- **Role**: Contains concrete implementations of interfaces defined in `domains` (e.g., Drizzle Repositories, external API clients, Next.js controllers/routes).
- **Dependencies**: Depends on `domains`, `database`, and `applications`.
- **Allowed**: Everything. This is where frameworks, DB clients, and external SDKs live.

---

## 2. Strict Type & Linting Enforcement

- **NEVER use `// @ts-ignore`, `// @ts-expect-error`, or `// @ts-nocheck`.** You MUST fix TypeScript errors by writing correct types or interfaces.
- **NEVER use `// eslint-disable` or `/* eslint-disable */`.** You MUST resolve linting errors by adhering to the established rules (e.g., fixing cross-layer import errors, removing unused variables, typing correctly).
- **NO `any` types.** Always define explicit interfaces or use `unknown` if the type is truly dynamic, then safely cast/narrow it down.

---

## 3. Detailed Examples

### 3.1 Domain Layer (`packages/domains/src/entities/user.ts`)
```typescript
export interface UserEntity {
  id: string;
  name: string;
  email: string;
}

export class User implements UserEntity {
  id: string;
  name: string;
  email: string;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
  }
}
```

### 3.2 Domain Layer - Interfaces (`packages/domains/src/repositories/user.repo.ts`)
```typescript
import type { User, UserEntity } from '../entities/user';

// Define the contract, NOT the implementation
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: UserEntity): Promise<User>;
}
```

### 3.3 Database Layer (`packages/database/src/schema/user.ts`)
```typescript
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});
```

### 3.4 Application Layer (`packages/applications/src/usecases/create-user.ts`)
```typescript
import { User } from '@shop/domains/entities/user';
import type { IUserRepository } from '@shop/domains/repositories/user.repo';

export class CreateUserUseCase {
  // Dependency Injection: Inject the interface, NOT the concrete class
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    const newUser = new User({ id: crypto.randomUUID(), name, email });
    return this.userRepository.save(newUser);
  }
}
```

### 3.5 Infrastructure Layer (`packages/infrastructures/src/repositories/user.repo.ts`)
```typescript
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '@shop/database/schema';

import type { IUserRepository } from '@shop/domains/repositories/user.repo';
import { User, type UserEntity } from '@shop/domains/entities/user';

// Concrete implementation
export class UserRepository implements IUserRepository {
  constructor(private readonly db: NodePgDatabase<never>) {}

  async findById(id: string): Promise<User | null> {
    const [result] = await this.db.select().from(users).where(eq(users.id, id));
    if (!result) return null;
    return new User(result);
  }

  async save(user: UserEntity): Promise<User> {
    const [result] = await this.db.insert(users).values(user).returning();
    return new User(result);
  }
}
```

### 3.6 Dependency Injection in Presentation Layer (`apps/web/src/shared/`)
When consuming these layers in the frontend application, instantiate them once in a shared directory to form a simple Dependency Injection container.

**`apps/web/src/shared/repositories/index.ts`**:
```typescript
import db from '@shop/database/db';
import { UserRepository } from '@shop/infrastructures/repositories/user';

export const userRepository = new UserRepository(db as never);
```

**`apps/web/src/shared/applications/user.usecase.ts`**:
```typescript
import { CreateUserUseCase } from '@shop/applications/use-cases/users/user';
import { userRepository } from '@/shared/repositories';

export const createUserUseCase = new CreateUserUseCase(userRepository);
```


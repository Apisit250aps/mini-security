---
name: clean-architecture-monorepo
description: Guidelines for the monorepo Clean Architecture pattern (domains -> database -> applications -> infrastructures), including strict rules against ignoring TS/ESLint errors.
user-invocable: false
---

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

### 3.1 Domain Layer - Schema-First Pattern (`packages/domains/src/schema/user.ts`)
Always use Zod for runtime validation and type inference in the Domain layer.

```typescript
import { z } from 'zod';
import { BaseEntity, StringField, EmailField } from '../lib/entity';

export const userSchema = BaseEntity({
  name: StringField({ required: true }),
  email: EmailField({ required: true })
});

export const createUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateUserSchema = userSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

export type UserEntity = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
```

### 3.2 Domain Layer - Entities (`packages/domains/src/entities/user.ts`)
Implement the class by inferring types from the schema.

```typescript
import type { UserEntity } from '../schema/user';

export class User implements UserEntity {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserEntity) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

### 3.3 Domain Layer - Interfaces (`packages/domains/src/repositories/user.repo.ts`)
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

### 3.7 API Layer (Controllers & Routes)
Use Hono for routing. Apply the **Ponytail Principle** (laziest, least boilerplate): Group related entities by module rather than creating separate files for every single entity.

**1. Controllers (`apps/web/src/api/controllers/`)**
Extend the base `Controller` and use `this.validator` for Zod validation. Keep use cases grouped by module (e.g., all company-related use cases in `company.controller.ts`).

```typescript
import Controller from '@/shared/utils/controller';
import { createUserUseCase } from '@/shared/applications/user.usecase';
import { createUserSchema } from '@shop/domains/schema/user';

class UserController extends Controller {
  public createUser = this.validator({ body: createUserSchema }, async (c) => {
    const body = c.get('body');
    const result = await createUserUseCase.execute({ data: body });
    return this.success(c, 'User created successfully', result);
  });
}
export default new UserController();
```

**2. Routes (`apps/web/src/api/routes/`)**
Create one route file per module.

```typescript
import { Hono } from 'hono';
import userController from '@/api/controllers/user.controller';

const userRoutes = new Hono();
userRoutes.post('/', userController.createUser);

export default userRoutes;
```

**3. Main Router (`apps/web/src/api/index.ts`)**
Register the module routes under a common API instance.

```typescript
import userRoutes from '@/api/routes/user.route';
import companyRoutes from '@/api/routes/company.route';

app.route('/users', userRoutes);
app.route('/company', companyRoutes);
```

### 3.8 API Specification (TypeSpec) Pattern
The `packages/client/spec` TypeSpec files MUST strictly align with the Domain Layer (Zod Schemas).

**1. Entities (`models/entities.tsp`)**
TypeSpec `Domain.Entity` models must mirror the exact structure of the `[entity]Schema` in `packages/domains/src/schema/`, including exact optionality and nullability (`| null`).

**2. DTOs (`models/[domain].tsp`)**
TypeSpec `Create[Entity]` and `Update[Entity]` must mirror the exact `.omit()` fields defined in Zod `create[Entity]Schema` and `update[Entity]Schema`.
Apply the **Ponytail Principle**: Do not redefine fields. Use TypeSpec utility types.
```tsp
model CreateUser
  is OmitProperties<
    User,
    "id" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"
  >;
```

**3. Services (`services/[domain].tsp`)**
Group endpoints by module interface (`@route("/[module]")`), utilizing standard wrapper responses (`ApiOkResponse`, `ApiErrorResponse`).

---
name: clean-architecture-best-practices
description: Guides the implementation of Clean Architecture, focusing on the dependency rule, separation of concerns, and layer isolation (Domain, Application, Interface Adapters, Infrastructure). Provides structured rules, key patterns, and TypeScript examples.
user-invocable: false
---

# Clean Architecture

A software architecture pattern that separates elements of a design into ring levels. The main rule is the **Dependency Rule**: source code dependencies can only point *inwards*. Inner layers contain business rules and have no knowledge of outer layers.

## Principles

1. **Independent of Frameworks.** The architecture does not depend on the existence of some library of feature laden software. This allows you to use such frameworks as tools, rather than having to cram your system into their limited constraints.
2. **Testable.** The business rules can be tested without the UI, Database, Web Server, or any other external element.
3. **Independent of UI.** The UI can change easily, without changing the rest of the system. A Web UI could be replaced with a console UI, for example, without changing the business rules.
4. **Independent of Database.** You can swap out Oracle or SQL Server, for Mongo, BigTable, CouchDB, or something else. Your business rules are not bound to the database.
5. **Independent of any external agency.** In fact, your business rules simply don't know anything at all about the outside world.

## Critical Rules

### 1. Domain Layer (Entities / Enterprise Business Rules)

- **Must be pure.** No dependencies on external frameworks, UI, or databases. No `import` from outside this layer.
- **Encapsulate enterprise-wide business rules.** An entity can be an object with methods, or a set of data structures and functions.
- **Changes in other layers should not affect this layer.**

### 2. Application Layer (Use Cases / Application Business Rules)

- **Encapsulate application-specific business rules.** This is where the core logic of the application resides.
- **Coordinate data flow.** It directs the flow of data to and from the entities, and directs those entities to use their enterprise-wide business rules to achieve the goals of the use case.
- **Define Interfaces (Ports).** Define `Repositories` and `Services` interfaces here. Do not import their concrete implementations.

### 3. Interface Adapters (Controllers, Presenters, Gateways)

- **Convert data.** Convert data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web.
- **No business logic.** Should only handle routing, HTTP requests/responses, or data mapping (e.g., Domain Models to DTOs).
- **Implement Presenters.** Used to format data for the UI.

### 4. Infrastructure Layer (Frameworks, DB, External APIs)

- **Where the details go.** The Web is a detail. The database is a detail. Keep these things on the outside where they can do little harm.
- **Implement interfaces.** This is where the concrete implementations of repositories (e.g., Prisma, Mongoose, TypeORM) and external services (e.g., AWS S3, Stripe) reside.
- **Dependency Injection.** Wire up the implementations to the interfaces required by the Application Layer.

## Key Patterns

These are the most common patterns that differentiate correct Clean Architecture code from coupled code.

### Dependency Inversion & Dependency Injection

Outer layers must implement interfaces defined by inner layers.

```typescript
// ❌ WRONG: Application layer depending on Infrastructure directly
import { PrismaClient } from '@prisma/client';

export class CreateUserUseCase {
  private db = new PrismaClient(); // Direct dependency on a specific DB detail

  async execute(data: UserData) {
    return this.db.user.create({ data });
  }
}

// ✅ CORRECT: Application layer depends on an Interface
// In application/interfaces/UserRepository.ts
export interface UserRepository {
  create(user: User): Promise<User>;
}

// In application/use-cases/CreateUserUseCase.ts
export class CreateUserUseCase {
  // Dependency is injected, usually via a DI container or manually
  constructor(private userRepository: UserRepository) {}

  async execute(data: UserData) {
    const user = User.create(data); // Domain Entity
    return this.userRepository.create(user);
  }
}
```

### Data Transfer Objects (DTO) vs Domain Models

Do not pass raw Database Entities or Domain Models directly to the presentation layer. Use Mappers to convert them to DTOs.

```typescript
// ❌ WRONG: Exposing Domain or DB models directly to the UI
export class UserController {
  constructor(private useCase: GetUserUseCase) {}

  async getUser(req: Request, res: Response) {
    const user = await this.useCase.execute(req.params.id);
    // Exposes internal domain structure, potentially sensitive data like passwords!
    res.json(user); 
  }
}

// ✅ CORRECT: Mapping to DTOs
export class UserController {
  constructor(private useCase: GetUserUseCase) {}

  async getUser(req: Request, res: Response) {
    const user = await this.useCase.execute(req.params.id);
    const userDTO = UserMapper.toDTO(user); // Strip sensitive/internal fields
    res.json(userDTO);
  }
}
```

## Component Organization (Folder Structure)

A typical file structure enforcing these boundaries:

```text
src/
├── domain/            # Layer 1: Entities, Value Objects, Domain Events
│   ├── User.ts
│   └── EmailValueObject.ts
├── application/       # Layer 2: Use Cases, Interfaces (Ports)
│   ├── use-cases/
│   │   └── CreateUserUseCase.ts
│   └── interfaces/    # Repositories & External Services interfaces
│       └── UserRepository.ts
├── presentation/      # Layer 3: Controllers, Resolvers, Routes, DTOs, ViewModels
│   ├── controllers/
│   │   └── UserController.ts
│   └── dtos/
│       └── UserResponseDTO.ts
└── infrastructure/    # Layer 4: DB implementations, Web Frameworks, Config
    ├── database/
    │   └── PrismaUserRepository.ts
    ├── web/
    │   └── ExpressRouter.ts
    └── DIContainer.ts # Wires dependencies together
```

## Quick Reference / Rules of Thumb

- **Imports direction:** 
  - `infrastructure` -> `application` -> `domain` (Valid)
  - `presentation` -> `application` -> `domain` (Valid)
  - `domain` -> `infrastructure` (❌ ILLEGAL)
  - `application` -> `infrastructure` (❌ ILLEGAL)
- **Interfaces (Ports):** Define Repository interfaces in the `application` layer. Implement them in the `infrastructure` layer.
- **Framework Agnostic:** Try to keep Next.js/Express.js specific objects (`req`, `res`, `NextResponse`) strictly inside the `presentation` or `infrastructure` layers. The `application` use-cases should receive standard JavaScript/TypeScript objects.

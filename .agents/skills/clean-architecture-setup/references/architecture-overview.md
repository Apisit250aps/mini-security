# Clean Architecture Overview & Dependency Inversion

## The Core Rings of Clean Architecture

Clean Architecture organizes software into concentric circles representing different areas of software:

```
                  ┌──────────────────────────────┐
                  │    Presentation Layer        │
                  │ (HTTP, CLI, WebSockets, UI)  │
                  ├──────────────────────────────┤
                  │    Infrastructure Layer      │
                  │   (Database, APIs, Cache)    │
                  ├──────────────────────────────┤
                  │     Application Layer        │
                  │   (Use Cases, DTOs, Ports)   │
                  ├──────────────────────────────┤
                  │        Domain Layer          │
                  │  (Entities, Value Objects)   │
                  └──────────────────────────────┘
```

### 1. Domain Layer (Innermost Ring)
- Contains Enterprise-wide business rules.
- Contains Entities, Value Objects, Domain Events, and Repository Interfaces.
- **Dependency Rule**: Depends on NO external libraries or other layers. Pure business logic only.

### 2. Application Layer
- Contains Application-specific business rules (Use Cases / Interactors).
- Orchestrates data flow to and from Entities.
- Defines input/output DTOs and interfaces for external dependencies (Ports).
- **Dependency Rule**: Depends only on the Domain Layer.

### 3. Infrastructure Layer
- Implements the interfaces defined in Domain (Repositories) and Application (Ports).
- Communicates with Database (SQL, MongoDB, Prisma, etc.), third-party APIs, Message Brokers.
- **Dependency Rule**: Depends on Application and Domain layers.

### 4. Presentation Layer (Outermost Ring)
- Handles user input, routes requests to Application Use Cases, and formats the output.
- Contains Controllers, Middlewares, Request Validators, and Presenters.
- **Dependency Rule**: Depends on Application and Domain layers.

---

## Dependency Inversion in Action (TypeScript Example)

### Step 1: Domain defines the contract (Interface)
```typescript
// src/domain/repositories/user.repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

### Step 2: Application uses the contract
```typescript
// src/application/use-cases/get-user.usecase.ts
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserDto } from '../dtos/user.dto';

export class GetUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    return UserDto.fromEntity(user);
  }
}
```

### Step 3: Infrastructure implements the contract
```typescript
// src/infrastructure/database/repositories/prisma-user.repository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return new User(record.id, record.name, record.email);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: { name: user.name, email: user.email },
      create: { id: user.id, name: user.name, email: user.email },
    });
  }
}
```

### Step 4: Composition Root (main.ts) wires them together
```typescript
// src/main.ts
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/database/repositories/prisma-user.repository';
import { GetUserUseCase } from './application/use-cases/get-user.usecase';
import { UserController } from './presentation/http/controllers/user.controller';

const prisma = new PrismaClient();
const userRepo = new PrismaUserRepository(prisma);
const getUserUseCase = new GetUserUseCase(userRepo);
const userController = new UserController(getUserUseCase);
```

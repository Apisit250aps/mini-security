---
name: usecase-pattern
description: Learn how to generate and implement Use Cases following the project's Clean Architecture pattern across domains and applications packages.
---

# Use Case Implementation Pattern

When generating or implementing Use Cases for this project, you MUST follow this strict structural pattern spanning the `packages/domains` and `packages/applications` workspaces.

## 1. Domain Layer (`packages/domains/src/applications/`)

The domain layer is responsible for defining the contract (Interfaces and Contexts) for the Use Case.

### Rules for Domain Layer:
1. **Contexts:** Create a specific Context type for every operation (e.g. `ICreate[Entity]Context`, `IUpdate[Entity]Context`).
2. **Generic BaseUseCase:** Use `BaseUseCase<Context, OutputType>` to define the interface of the Use Case.
3. **Exports:** Explicitly export **all** Context types and Use Case types.

**Template:**
```typescript
import { BaseUseCase } from '..';
import { EntityName } from '../entities/entity-name';
import { CreateEntityName, UpdateEntityName } from '../schema/entity-name';

type ICreateEntityNameContext = { data: CreateEntityName };
type IUpdateEntityNameContext = { id: string; data: UpdateEntityName };
type IDeleteEntityNameContext = { id: string };
type IGetEntityNameContext = { id: string };
type IGetEntityNamesContext = { filter: Record<string, unknown> };

type ICreateEntityNameUseCase = BaseUseCase<ICreateEntityNameContext, EntityName>;
type IUpdateEntityNameUseCase = BaseUseCase<IUpdateEntityNameContext, EntityName>;
type IDeleteEntityNameUseCase = BaseUseCase<IDeleteEntityNameContext, void>;
type IGetEntityNameUseCase = BaseUseCase<IGetEntityNameContext, EntityName | null>;
type IGetEntityNamesUseCase = BaseUseCase<IGetEntityNamesContext, EntityName[]>;

export type {
  ICreateEntityNameContext,
  IUpdateEntityNameContext,
  IDeleteEntityNameContext,
  IGetEntityNameContext,
  IGetEntityNamesContext,
  ICreateEntityNameUseCase,
  IUpdateEntityNameUseCase,
  IDeleteEntityNameUseCase,
  IGetEntityNameUseCase,
  IGetEntityNamesUseCase,
};
```

## 2. Applications Layer (`packages/applications/src/use-cases/`)

The applications layer contains the concrete implementation of the Use Cases defined in the domain layer.

### Rules for Applications Layer:
1. **Export Style:** Use `export class ...` for the Use Case implementation.
2. **Constructor Injection:** Accept the respective Repository via the constructor.
3. **Validation:** Use Zod's `safeParseAsync` method on the incoming context data.
4. **Error Handling:** Check `!parsed.success` and throw a `ValidationError`. Throw `NotFoundError` if entities are missing during read/update/delete.
5. **Business Logic:** Inject domain-specific business rules (e.g. duplicate checking) inside the `execute` method before making changes via the repository.

**Template:**
```typescript
import {
  ICreateEntityNameContext,
  ICreateEntityNameUseCase,
} from '@shop/domains/applications/entity-name';
import { EntityName } from '@shop/domains/entities';
import { IEntityNameRepository } from '@shop/domains/repositories/entity-name';
import { createEntityNameSchema } from '@shop/domains/schema/entity-name';
import { ValidationError, NotFoundError } from '../lib/error';

export class CreateEntityNameUseCase implements ICreateEntityNameUseCase {
  constructor(private readonly repo: IEntityNameRepository) {}

  async execute(context: ICreateEntityNameContext): Promise<EntityName> {
    const parsed = await createEntityNameSchema.safeParseAsync(context.data);
    if (!parsed.success) throw new ValidationError('Invalid EntityName data');
    
    // Add specific business validation here if necessary
    
    return this.repo.create(parsed.data);
  }
}
```

## 3. Repositories Layer (`packages/domains/src/repositories/`)

When creating the repository interface, ensure it correctly implements the generic signature of `BaseRepository`.

### Rule:
`BaseRepository` always takes exactly 3 arguments: `Entity`, `CreatePayload`, `UpdatePayload`.

**Template:**
```typescript
import { BaseRepository } from '..';
import { EntityName } from '../entities/entity-name';
import { CreateEntityName, UpdateEntityName } from '../schema/entity-name';

export interface IEntityNameRepository extends BaseRepository<EntityName, CreateEntityName, UpdateEntityName> {
  // Additional specialized queries here
}
```

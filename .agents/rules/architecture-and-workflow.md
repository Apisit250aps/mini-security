# Architecture and Workflow Rules

This project uses a Turborepo monorepo structure and strictly follows **Clean Architecture** principles. All AI agents must adhere to these structural boundaries and workflow rules.

## 1. Clean Architecture Structure

The workspace is divided into `apps/` (applications) and `packages/` (shared libraries). Each package has a distinct role in the Clean Architecture.

### Presentation Layer (`apps/web`, `packages/ui`)
- **Role**: Handles user interfaces, routing, and user interactions.
- **`apps/web`**: A Next.js application. It depends on `domains` for business rules, `infrastructures` for services, and `ui` for visual components. It MUST NOT contain direct database queries or raw business logic.
  - **Shared Modules/Components (`apps/web/src/shared/components`)**: This is where "Combined Components" or "Compound Components" go (e.g., Form components combining UI primitives with `react-hook-form`, or Tables combining UI primitives with `@tanstack/react-table`).
- **`packages/ui`**: Shared UI components (e.g., shadcn/ui). This package must remain agnostic to business logic and complex third-party state libraries (no `react-hook-form`, no data tables). It MUST ONLY contain default/primitive shadcn components and act purely as a dumb Design System.

### Domain Layer (`packages/domains`)
- **Role**: The core business logic and enterprise rules. This layer is isolated and independent of frameworks, databases, and external APIs.
- **Structure**:
  - `src/entities/`: Core business models and types.
  - `src/repositories/`: Interfaces defining data access contracts (e.g., `IUserRepository`).
  - `src/schema/`: Data validation schemas (e.g., Zod).
- **Rule**: `domains` MUST NOT import from `infrastructures`, `database`, or `apps`.

### Infrastructure Layer (`packages/infrastructures`)
- **Role**: Implements external services, APIs, and frameworks (e.g., Authentication, Email services).
- **Structure**: Includes modules like `auth/` (Better Auth integration).
- **Rule**: Depends on `domains` to fulfill business requirements but keeps third-party libraries out of the core domain.

### Data Access Layer (`packages/database`)
- **Role**: Manages database schemas (Drizzle ORM), migrations, and database connections.
- **Rule**: It implements the repository interfaces defined in `domains`. It must not contain business rules.

---

## 2. Agent Execution & Verification Workflow

Whenever you make code changes in this repository, you **MUST** follow these steps to ensure code quality and consistency.

### Mandatory Verification (Run Every Time)
After writing or modifying code, you MUST execute the following commands in the terminal (at the project root):

1. **Check Types**: Verify TypeScript rules across all packages.
   ```sh
   npm run check-types
   ```
2. **Lint Code**: Check for ESLint rule violations.
   ```sh
   npm run lint
   ```
3. **Format Code**: Apply Prettier formatting to all files.
   ```sh
   npm run format
   ```

*Note: If `lint` or `check-types` produces errors, you MUST fix them before concluding your task.*

### Common Commands
- **Start Development Server**: `npm run dev`
- **Build Production**: `npm run build`

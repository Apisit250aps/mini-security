---
name: clean-architecture-format
description: Enforce consistent file naming conventions, folder structures, Prettier styling, and architectural boundary linting rules.
tags:
  - both
  - fullstack
---

# Clean Architecture Format & Style Skill

Use this skill to apply consistent file naming, organize project structures, format code, and configure boundary linting tools.

---

## 🎯 Primary Responsibilities

1. **Standardize File Suffixes**: Ensure all files clearly declare their architectural role via standardized naming conventions.
2. **Setup Code Formatting (Prettier)**: Configure `.prettierrc` (`semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "all"`) and `.prettierignore` to ensure consistent code styling across all layers.
3. **Setup Dependency Boundary Linting**: Configure tools like ESLint `import/no-restricted-paths`, Dependency Cruiser, or ArchUnit to prevent unauthorized imports across layers.
4. **Enforce Type & Lint Integrity**: Zero tolerance for `@ts-ignore`, `eslint-disable`, and `any`.

---

## 🏷️ Standard Naming Conventions

| Architectural Role | File Suffix Convention | Example |
| :--- | :--- | :--- |
| **Domain Entity** | `<name>.entity.ts` | `user.entity.ts` |
| **Value Object** | `<name>.vo.ts` | `email.vo.ts` |
| **Domain Event** | `<name>.event.ts` | `user-registered.event.ts` |
| **Repository Interface** | `<name>.repository.interface.ts` | `user.repository.interface.ts` |
| **Use Case / Interactor** | `<name>.usecase.ts` | `register-user.usecase.ts` |
| **DTO (Input/Output)** | `<name>.dto.ts` | `register-user.dto.ts` |
| **Application Port** | `<name>.port.ts` | `email-service.port.ts` |
| **Concrete Repository** | `<adapter>-<name>.repository.ts` | `prisma-user.repository.ts` |
| **Service Adapter** | `<vendor>-<name>.service.ts` | `nodemailer-email.service.ts` |
| **HTTP Controller** | `<name>.controller.ts` | `register-user.controller.ts` |
| **HTTP Middleware** | `<name>.middleware.ts` | `auth.middleware.ts` |
| **HTTP Routes** | `<name>.routes.ts` | `user.routes.ts` |

---

## 🛡️ Boundary Linting Rules (ESLint Example)

Ensure imports are restricted according to Clean Architecture rules:

```javascript
// .eslintrc.js (or eslint.config.js)
module.exports = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Domain cannot import from Application, Infrastructure, or Presentation
          {
            target: './src/domain',
            from: ['./src/application', './src/infrastructure', './src/presentation'],
            message: 'Domain layer must not import from outer layers.',
          },
          // Application cannot import from Infrastructure or Presentation
          {
            target: './src/application',
            from: ['./src/infrastructure', './src/presentation'],
            message: 'Application layer must not import from Infrastructure or Presentation.',
          },
          // Presentation cannot import directly from Infrastructure
          {
            target: './src/presentation',
            from: ['./src/infrastructure'],
            message: 'Presentation layer must not directly depend on Infrastructure (use Application).',
          },
        ],
      },
    ],
  },
};
```

---

## 📚 Further Reference

See [naming-and-style.md](references/naming-and-style.md) for full style guide and Dependency Cruiser configs.

---
name: clean-architecture-presentation
description: Implement Presentation Layer components (HTTP Controllers, REST routes, GraphQL resolvers, gRPC handlers, input validation schemas, ViewModels).
tags:
  - both
  - backend
  - frontend
---

# Clean Architecture Presentation Layer Skill

Use this skill when building or refactoring the **Presentation / Web / Interface Layer** (`src/presentation`).

---

## 🎯 Primary Responsibilities

1. **HTTP Controllers & Route Handlers**: Receive client requests, parse headers/params/body, pass data to Application Use Cases, and return appropriate HTTP status codes & payloads.
2. **Input Validation**: Validate incoming request schema (e.g., using Zod, Joi, class-validator, Pydantic) at the presentation boundary before invoking use cases.
3. **HTTP Middlewares**: Handle authentication, rate limiting, CORS, error handling, and tracing.
4. **Presenters & ViewModels**: Format output DTOs into presentation-specific view models or REST/JSON:API response shapes when needed.

---

## 🏗️ Controller Responsibilities vs Use Case

```text
[Client HTTP Request]
         │
         ▼
[Presentation: Controller]  ──▶ Validates HTTP schema (Zod/Joi)
         │                  ──▶ Extracts auth/params
         │                  ──▶ Calls Use Case with Input DTO
         ▼
[Application: Use Case]     ──▶ Executes business logic
         │                  ──▶ Returns Output DTO
         ▼
[Presentation: Presenter]   ──▶ Formats HTTP response (200 OK / 201 Created / JSON)
```

---

## 🚫 Presentation Layer Guardrails

- ❌ **NEVER Call Repositories Directly**: Controllers must NEVER inject or call repository classes/interfaces. All interactions must go through Use Cases.
- ❌ **NEVER Embed Business Invariants in Controllers**: Basic shape/type validation (e.g. `body.email is a string`) happens in Presentation, but domain business rules (e.g. `cannot register deactivated user`) belong in Domain/Use Cases.
- ❌ **Translate Errors to HTTP Codes**: Map application/domain exceptions cleanly to HTTP 400, 401, 403, 404, 409, 500 without leaking internal stack traces.

---

## 📚 Further Reference

See [presentation-patterns.md](references/presentation-patterns.md) for Express/Fastify controller and error handling examples.

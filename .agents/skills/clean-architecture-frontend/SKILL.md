---
name: clean-architecture-frontend
description: Frontend Architecture patterns for separating dumb Design System primitives (packages/ui) from Application combined components, forms, and data tables (apps/web).
tags:
  - frontend
---

# Clean Architecture Frontend Skill 🎨

Use this skill when building, composing, or refactoring Frontend UI components in a Clean Architecture / Turborepo setup.

---

## 🎯 Target Scope: `Frontend`

---

## 🏛️ Frontend Separation of Concerns

```text
┌────────────────────────────────────────────────────────┐
│  apps/web (Application UI Layer)                       │
│  - Combined / Compound Components (Form Fields, Table) │
│  - State Orchestration (react-hook-form, TanStack)     │
│  - Feature Screens & Pages                             │
│  - Consumes SDK / TypeSpec Client                      │
└──────────────────────────┬─────────────────────────────┘
                           │ Imports primitives via `@<project>/ui`
                           ▼
┌────────────────────────────────────────────────────────┐
│  packages/ui (Design System / Primitive UI)            │
│  - Dumb UI Primitives (Button, Input, Dialog, Select)  │
│  - Pure Design System (Tailwind CSS, shadcn/ui)        │
│  - ZERO Business Logic & NO Form State Orchestration   │
└────────────────────────────────────────────────────────┘
```

---

## 📐 Strict Separation Rules

### 1. `packages/ui` (The Dumb Design System)
- **Role**: Pure reusable UI component library.
- **Rules**:
  - **Primitives Only**: Only default/primitive components (`button.tsx`, `input.tsx`, `dialog.tsx`, `select.tsx`).
  - **No Business Logic**: Must not contain domain knowledge or app-specific behavior.
  - **No State Libraries**: MUST NOT import or install `react-hook-form`, `@tanstack/react-table`, or `zod`.
  - **No Combined Components**: Never place compound components (e.g. `InputField` with label, error message, and controller) in `packages/ui`.

### 2. `apps/web` (The Application UI)
- **Role**: The actual web application implementing features, screens, and user interactions.
- **Rules**:
  - **Combined Components**: Place in `apps/web/src/shared/components/...` (e.g. `shared/components/form/input-field.tsx`).
  - **External UI Libraries**: Install `react-hook-form`, `@tanstack/react-table`, etc., in `apps/web`.
  - **Importing Primitives**: Import primitive components from `@<project>/ui/components/...`.

---

## 📝 Example: Building a Form Component

```tsx
// apps/web/src/shared/components/form/input-field.tsx
import { Input } from '@<project>/ui/components/input';
import { Controller, useFormContext } from 'react-hook-form';

export function InputField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-1">
          <label className="text-sm font-medium">{label}</label>
          <Input {...field} />
          {error && <span className="text-xs text-red-500">{error.message}</span>}
        </div>
      )}
    />
  );
}
```

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

### 3. Module Views (`apps/web/src/modules/**/views/**`)
- **Role**: Feature view screens consumed by Next.js app routes (`apps/web/src/app/**/page.tsx`).
- **Rules**:
  - **MANDATORY**: Every view screen in `apps/web/src/modules/**/views/**` **MUST** be wrapped in `<PageLayout pageId="...">` or `<PageLayout title="..." description="...">` from `@/shared/components/layouts/page-layout`.
  - **Loading State (`isLoading`)**: Pass query loading states directly to `<PageLayout isLoading={query.isLoading} loadingText="...">` to automatically display a minimalist, non-distracting loading state for the content section while preserving header consistency.
  - **Action Injection**: Action triggers/buttons (such as create modal dialogs or navigation links) MUST be passed into the `actions` prop: `actions={<ModuleCreateAction />}`.
  - **Page Route Delegation**: Next.js route `page.tsx` files should be lightweight delegates rendering the View component (e.g. `return <ModuleListView />;`).

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

---

## 📝 Example: Building a Module View with `PageLayout`

```tsx
// apps/web/src/modules/product/views/product-list-view.tsx
'use client';

import React from 'react';
import PageLayout from '@/shared/components/layouts/page-layout';
import ProductDataTable from '../components/table/product-data-table';
import ProductCreateAction from '../components/product-create-action';

export default function ProductListView() {
  return (
    <PageLayout pageId="product" actions={<ProductCreateAction />}>
      <ProductDataTable />
    </PageLayout>
  );
}
```

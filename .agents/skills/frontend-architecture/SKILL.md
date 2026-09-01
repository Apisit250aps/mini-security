---
name: Frontend UI Architecture & Component-Composition
description: Rules for frontend UI composition, specifically the boundaries between the 'ui' package (shadcn primitives) and the 'web' app (combined components like forms and tables). Use when agents need to create, modify, or move React components.
---

# Frontend UI Architecture

The frontend presentation layer strictly separates "Primitive Components" from "Combined/Compound Components" across two workspaces: `packages/ui` and `apps/web`.

## 1. `packages/ui` (The Design System)
This package is reserved strictly for **default shadcn/ui primitive components** and base styles.

**Rules for `packages/ui`:**
- MUST ONLY contain raw, generic UI components (e.g., `button.tsx`, `select.tsx`, `dialog.tsx`).
- MUST NOT contain business logic.
- MUST NOT install or import complex third-party libraries for state orchestration (e.g., `react-hook-form`, `@tanstack/react-table`, `zod`).
- MUST NOT contain "Combined Components" (e.g., a specific form field that integrates labels, errors, and controller logic).
- Shadcn components added via `npx shadcn@latest add` should go here.

## 2. `apps/web` (The Application)
This workspace implements the actual application screens and features.

**Rules for `apps/web`:**
- **Combined Components**: Any component that combines multiple primitives (e.g., wrapping an `Input` inside a `react-hook-form` `Controller` to make an `InputField`) MUST be placed in `apps/web/src/shared/components/...` (or the relevant module).
- **External UI Libraries**: If a component requires a specialized library (like `@tanstack/react-table` for data tables, or `react-hook-form` for form state), that library must be installed in `apps/web`, and the combined component must be built in `apps/web`.
- **Importing Primitives**: Combined components in `apps/web` import the primitive building blocks from the UI package using the package name alias:
  ```tsx
  // Example in apps/web/src/shared/components/form/input-field.tsx
  import { Input } from "@shop/ui/components/input";
  import { Controller } from "react-hook-form";
  ```

## 3. Workflow Example: Building a Form Component
If you are asked to create a new generic form component (e.g., `ColorPickerField`):
1. **Check primitives**: Do we have a base color picker in `packages/ui`? If not, create/add a dumb `color-picker.tsx` primitive in `packages/ui/src/components`.
2. **Create Combined Component**: Go to `apps/web/src/shared/components/form/` and create `color-picker-field.tsx`.
3. **Orchestrate**: In `color-picker-field.tsx`, import `ColorPicker` from `@shop/ui/components/color-picker` and wrap it with `react-hook-form`'s `Controller`.

## 4. Module Views Standard (`PageLayout`)
All view components in `apps/web/src/modules/**/views/**` **MUST** use `PageLayout` from `@/shared/components/layouts/page-layout`:
```tsx
import PageLayout from '@/shared/components/layouts/page-layout';

export default function ModuleListView() {
  const query = useModuleListQueries();
  return (
    <PageLayout
      pageId="<pageId>"
      isLoading={query.isLoading}
      actions={<ModuleCreateAction />}
    >
      <ModuleDataTable />
    </PageLayout>
  );
}
```
Next.js page files in `apps/web/src/app/**/page.tsx` simply delegate and render the View component.

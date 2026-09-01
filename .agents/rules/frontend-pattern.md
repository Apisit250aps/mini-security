# Frontend Architecture & Pattern Rules

This project uses a strict separation of concerns for the Frontend UI, dividing responsibilities between the generic Design System (`packages/ui`) and the specific Application UI (`apps/web`).

All AI agents MUST adhere to these rules when modifying, creating, or composing React components.

## 1. `packages/ui` (The Design System)
**Role**: A pure, dumb UI component library containing generic building blocks (e.g., shadcn/ui components).

### Rules:
- **Primitives Only**: MUST ONLY contain default/primitive components (e.g., `button.tsx`, `select.tsx`, `dialog.tsx`).
- **No Business Logic**: MUST NOT contain any domain knowledge, business logic, or app-specific behavior.
- **No State Orchestration Libraries**: MUST NOT install or import complex third-party libraries for state orchestration (e.g., `react-hook-form`, `@tanstack/react-table`, `zod`). 
- **No Combined Components**: MUST NOT contain "Combined Components" or "Compound Components" (e.g., a specific form field that integrates labels, error messages, and `react-hook-form` controller logic).
- **CLI Usage**: Components added via `npx shadcn@latest add` should go here and remain as close to default as possible.

## 2. `apps/web` (The Application)
**Role**: The actual web application that implements features, screens, and complex user flows.

### Rules:
- **Combined Components**: Any component that combines multiple primitives (e.g., wrapping an `Input` inside a `react-hook-form` `Controller` to make an `InputField`) MUST be placed in `apps/web/src/shared/components/...` (or the relevant feature module).
- **External UI Libraries**: If a component requires a specialized library (like `@tanstack/react-table` for data tables, or `react-hook-form` for form state), that library MUST be installed in `apps/web`. The combined component utilizing it must also reside in `apps/web`.
- **Importing Primitives**: Combined components in `apps/web` MUST import the primitive building blocks from the UI package using the package name alias `@shop/ui`.
  
  **Correct Example**:
  ```tsx
  // apps/web/src/shared/components/form/input-field.tsx
  import { Input } from "@shop/ui/components/input";
  import { Controller } from "react-hook-form";
  ```

## Workflow Example: Building a Form Component
When asked to create a new generic form component (e.g., `ColorPickerField`):
1. **Check primitives**: Do we have a base color picker in `packages/ui`? If not, create/add a raw `color-picker.tsx` primitive in `packages/ui/src/components`.
2. **Create Combined Component**: Go to `apps/web/src/shared/components/form/` and create `color-picker-field.tsx`.
3. **Orchestrate**: In `color-picker-field.tsx`, import `ColorPicker` from `@shop/ui/components/color-picker` and wrap it with `react-hook-form`'s `Controller`.

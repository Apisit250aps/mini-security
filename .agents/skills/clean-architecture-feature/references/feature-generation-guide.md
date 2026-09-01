# Feature Generation Guidelines & Best Practices

## 🧠 Core Principles for Feature Creation

1. **Inward-to-Outward Order (Domain First)**:
   - Always define types and Zod validation rules in `packages/domains` before writing any database table or controller.
   - If a business rule changes, update the Domain first.

2. **Ponytail Principle (Module Grouping)**:
   - Don't create separate controller files for `create-product.controller.ts`, `get-product.controller.ts`, etc.
   - Group them inside `product.controller.ts` under class `ProductController extends Controller`.

3. **Subpath Imports**:
   - Use `#lib/*`, `#schema/*`, `#entities/*` internally within the layer package.
   - Use `@<project>/domains/...` when importing from outside packages.

4. **Zero Tolerance Quality Check**:
   - Do not stop until `npm run check-types` and `npm run lint` pass with 0 errors and 0 warnings.

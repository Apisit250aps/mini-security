# Form Builder ordering

Implemented 2026-09-15.

## Behavior

- Section and field dialogs assign the next order from the current sibling count. Both builder and table actions pass the required data.
- Sections reorder within a draft version. Fields reorder within their current section; moving fields between sections is unsupported.
- Pointer and keyboard sensors use the dnd-kit sortable preset. Focus a handle, press Space, use arrow keys, then Space to drop or Escape to cancel.
- The query cache updates immediately, restores its previous value after a failed save, and refetches after success or failure. Handles and publishing are disabled while a reorder is pending.

## API and storage

- `PATCH /forms/templates/:id/sections/reorder`
- `PATCH /forms/templates/:id/fields/reorder`
- Body: `{ formVersionId, items: [{ id, sortOrder }] }`.
- Requires `form_template:update`, the persisted version's organization scope, and a matching template/version. Only DRAFT is editable.
- Each request must contain all siblings, with unique IDs and consecutive zero-based orders. Foreign items, partial lists, and cross-section field lists are rejected before writes.
- Validation reads and writes run within the existing serializable Unit of Work.
- `sort_order` records the author's explicit presentation decision. It is source data, not a derived count. No database schema migration is needed.
- TypeSpec is the source of the generated SDK; regenerate with `npm run generate --workspace=@repo/client`.

## Verification

- `npm run check-types`: passed.
- `npm run lint`: passed with existing repository warnings, no errors.
- `npx turbo run build --filter=web`: passed.
- `node_modules/.bin/tsx --test packages/applications/tests/form-reorder.test.ts`: 25 passed.
- `node_modules/.bin/tsx --test apps/web/tests/form-reorder.test.ts`: 2 passed; verifies optimistic ordering, rollback, API error propagation, and invalidation with a real QueryClient.
- Authenticated localhost browser: created separate draft “ทดสอบเรียงลำดับ”; added two sections and two fields without order inputs; reordered sections and fields using keyboard handles; page reload retained both saved orders.
- Pointer drag automation activated the handle but did not complete a move; mouse/touch drop remains unverified. Keyboard drag/drop and persistence were verified.
- Test draft retained at `/organization/forms/templates/01a0a361-8ebd-76f8-9996-6eb6dfa8adf8/builder`.

## Field editing and deletion

- Added edit/delete actions for draft fields, with populated edit dialog and delete confirmation.
- Editing may move a field to another section in the same draft; the old section is compacted and the field is appended to the destination. Deletion compacts remaining sibling order.
- PUT and DELETE `/forms/templates/:id/fields/:fieldId` enforce update permission, stored organization scope, matching template/version, and DRAFT status. Client ownership/order overrides are rejected.
- SELECT edits retain existing option values for unchanged labels and preserve other config keys when the field type stays the same.
- Added 15 application tests for edit/delete/move, permission and tenant checks, published-version protection and protected inputs. Combined form tests: 42 passed.
- Authenticated browser verified edit/save/reload and delete confirmation/cancel. Actual deletion was tested with repository doubles, not executed against live data.

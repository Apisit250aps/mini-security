import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type {
  IFormFieldRepository,
  IFormVersionRepository,
  IFormSectionRepository,
} from '@repo/domains/repositories/form';
import {
  EditFormFieldUseCase,
  DeleteFormFieldUseCase,
} from '../src/use-cases/form/form-field.usecase';
const sectionId = '11111111-1111-4111-8111-111111111111';
const destinationId = '22222222-2222-4222-8222-222222222222';
const ctx = {
  user: { id: 'actor' },
  activeCompanyId: 'company',
  permissions: 'form_template:update',
  formTemplateId: 'template',
  fieldId: 'field',
};
const data = {
  formSectionId: sectionId,
  label: 'Edited',
  type: 'TEXT' as const,
  description: null,
  isRequired: false,
  config: {},
};
function fixture(status = 'DRAFT') {
  let inside = false;
  const writes: object[] = [];
  const field = {
    id: 'field',
    companyId: 'company',
    formVersionId: 'version',
    formSectionId: sectionId,
    sortOrder: 0,
  };
  const fields = {
    findById: async () => field,
    findByVersionId: async () => [
      field,
      { ...field, id: 'sibling', sortOrder: 1 },
    ],
    update: async (id: string, value: object) => {
      assert.ok(inside);
      writes.push(value);
      return { ...field, ...value };
    },
    delete: async (id: string) => {
      assert.ok(inside);
      writes.push({ deleted: id });
    },
    reorderItems: async (items: object[]) => {
      assert.ok(inside);
      writes.push(items);
    },
  } as IFormFieldRepository;
  const version = { companyId: 'company', formTemplateId: 'template', status };
  const versions = { findById: async () => version } as IFormVersionRepository;
  const section = {
    id: destinationId,
    companyId: 'company',
    formVersionId: 'version',
  };
  const sections = {
    findById: async (id: string) => ({ ...section, id }),
  } as IFormSectionRepository;
  const uow: IUnitOfWork = {
    transaction: async (work) => {
      inside = true;
      try {
        return await work();
      } finally {
        inside = false;
      }
    },
  };
  return {
    field,
    version,
    section,
    writes,
    edit: new EditFormFieldUseCase(uow, versions, fields, sections),
    remove: new DeleteFormFieldUseCase(uow, versions, fields),
  };
}
test('edit retains sort order and writes editable facts', async () => {
  const f = fixture();
  const result = await f.edit.execute({ ...ctx, data });
  assert.equal(result.label, 'Edited');
  assert.equal(result.sortOrder, 0);
});
test('move compacts old section and appends to new section', async () => {
  const f = fixture();
  await f.edit.execute({
    ...ctx,
    data: { ...data, formSectionId: destinationId },
  });
  assert.deepEqual(f.writes[0], [{ id: 'sibling', sortOrder: 0 }]);
  assert.equal(f.writes.length, 3);
});
test('delete compacts sibling order', async () => {
  const f = fixture();
  await f.remove.execute(ctx);
  assert.deepEqual(f.writes, [
    { deleted: 'field' },
    [{ id: 'sibling', sortOrder: 0 }],
  ]);
});
for (const operation of ['edit', 'remove'] as const) {
  for (const status of ['PUBLISHED', 'ARCHIVED'])
    test(`${operation} rejects ${status}`, async () => {
      const f = fixture(status);
      await assert.rejects(f[operation].execute({ ...ctx, data }), /draft/i);
      assert.equal(f.writes.length, 0);
    });
  test(`${operation} requires permission`, async () => {
    const f = fixture();
    await assert.rejects(
      f[operation].execute({ ...ctx, data, permissions: '' }),
      /permission/i,
    );
    assert.equal(f.writes.length, 0);
  });
  test(`${operation} rejects foreign company`, async () => {
    const f = fixture();
    f.field.companyId = 'other';
    await assert.rejects(f[operation].execute({ ...ctx, data }), /company/i);
    assert.equal(f.writes.length, 0);
  });
  test(`${operation} rejects foreign template`, async () => {
    const f = fixture();
    await assert.rejects(
      f[operation].execute({ ...ctx, data, formTemplateId: 'other' }),
      /not found/i,
    );
    assert.equal(f.writes.length, 0);
  });
}
test('edit rejects foreign destination section', async () => {
  const f = fixture();
  f.section.formVersionId = 'other';
  await assert.rejects(f.edit.execute({ ...ctx, data }), /same draft/i);
  assert.equal(f.writes.length, 0);
});
test('edit rejects client ownership and order changes', async () => {
  const f = fixture();
  await assert.rejects(
    f.edit.execute({
      ...ctx,
      data: { ...data, ...{ companyId: 'company', sortOrder: 10 } },
    }),
    /invalid/i,
  );
  assert.equal(f.writes.length, 0);
});

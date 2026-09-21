import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type {
  IFormVersionRepository,
  IFormSectionRepository,
  IFormFieldRepository,
} from '@repo/domains/repositories/form';
import { ReorderFormSectionUseCase } from '../src/use-cases/form/reorder-form-section.usecase';
import { ReorderFormFieldUseCase } from '../src/use-cases/form/reorder-form-field.usecase';

const ids = Array.from(
  { length: 6 },
  (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
);
const [versionId, templateId, organizationId, a, b, c] = ids as [
  string,
  string,
  string,
  string,
  string,
  string,
];
const context = {
  user: { id: 'actor', isActive: true },
  activeOrganizationId: organizationId,
  permissions: 'form_template:update',
  formTemplateId: templateId,
  formVersionId: versionId,
  items: [
    { id: b, sortOrder: 0 },
    { id: a, sortOrder: 1 },
  ],
};

for (const kind of ['section', 'field'] as const) {
  function fixture(status = 'DRAFT', foreign = false) {
    let inside = false;
    let writes = 0;
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
    const versions = {
      findById: async () => {
        assert.ok(inside);
        return {
          id: versionId,
          formTemplateId: templateId,
          organizationId: foreign ? c : organizationId,
          status,
        };
      },
    } as IFormVersionRepository;
    const records = [a, b].map((id) => ({
      id,
      organizationId,
      formVersionId: versionId,
      formSectionId: a,
    }));
    const repository = {
      findByVersionId: async () => records,
      reorderItems: async (items: typeof context.items) => {
        assert.ok(inside);
        assert.deepEqual(items, context.items);
        writes++;
      },
    };
    const useCase =
      kind === 'section'
        ? new ReorderFormSectionUseCase(
            uow,
            versions,
            repository as IFormSectionRepository,
          )
        : new ReorderFormFieldUseCase(
            uow,
            versions,
            repository as IFormFieldRepository,
          );
    return { useCase, records, writes: () => writes };
  }
  test(`${kind}: reorders all siblings atomically`, async () => {
    const f = fixture();
    await f.useCase.execute(context);
    assert.equal(f.writes(), 1);
  });
  for (const status of ['PUBLISHED', 'ARCHIVED'])
    test(`${kind}: rejects ${status}`, async () => {
      const f = fixture(status);
      await assert.rejects(f.useCase.execute(context), /draft/i);
      assert.equal(f.writes(), 0);
    });
  test(`${kind}: rejects foreign organization`, async () => {
    const f = fixture('DRAFT', true);
    await assert.rejects(f.useCase.execute(context), /organization/i);
    assert.equal(f.writes(), 0);
  });
  test(`${kind}: requires update permission`, async () => {
    const f = fixture();
    await assert.rejects(
      f.useCase.execute({ ...context, permissions: '' }),
      /permission/i,
    );
    assert.equal(f.writes(), 0);
  });
  test(`${kind}: rejects wrong template`, async () => {
    const f = fixture();
    await assert.rejects(
      f.useCase.execute({ ...context, formTemplateId: c }),
      /not found/i,
    );
    assert.equal(f.writes(), 0);
  });
  for (const items of [
    [],
    [{ id: a, sortOrder: 0 }],
    [
      { id: a, sortOrder: 0 },
      { id: a, sortOrder: 1 },
    ],
    [
      { id: a, sortOrder: 0 },
      { id: b, sortOrder: 0 },
    ],
    [
      { id: a, sortOrder: 0 },
      { id: c, sortOrder: 1 },
    ],
    [
      { id: a, sortOrder: 0 },
      { id: b, sortOrder: 5 },
    ],
  ])
    test(`${kind}: rejects invalid set ${JSON.stringify(items)}`, async () => {
      const f = fixture();
      await assert.rejects(f.useCase.execute({ ...context, items }));
      assert.equal(f.writes(), 0);
    });
  if (kind === 'field')
    test('field: rejects cross-section reorder', async () => {
      const f = fixture();
      f.records[1]!.formSectionId = c;
      await assert.rejects(f.useCase.execute(context), /same section/i);
      assert.equal(f.writes(), 0);
    });
}

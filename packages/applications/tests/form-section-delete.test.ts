import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type {
  IFormFieldRepository,
  IFormVersionRepository,
  IFormSectionRepository,
} from '@repo/domains/repositories/form';
import { DeleteFormSectionUseCase } from '../src/use-cases/form/form-section.usecase';

const sectionId = '11111111-1111-4111-8111-111111111111';
const siblingSectionId = '22222222-2222-4222-8222-222222222222';
const ctx = {
  user: { id: 'actor' },
  activeOrganizationId: 'organization',
  permissions: 'form_template:update',
  formTemplateId: 'template',
  sectionId,
};

function fixture(status = 'DRAFT') {
  let insideTx = false;
  const writes: object[] = [];

  const section = {
    id: sectionId,
    organizationId: 'organization',
    formVersionId: 'version',
    title: 'Section 1',
    sortOrder: 0,
  };

  const siblingSection = {
    id: siblingSectionId,
    organizationId: 'organization',
    formVersionId: 'version',
    title: 'Section 2',
    sortOrder: 1,
  };

  const field1 = {
    id: 'field-1',
    organizationId: 'organization',
    formVersionId: 'version',
    formSectionId: sectionId,
    sortOrder: 0,
  };

  const field2 = {
    id: 'field-2',
    organizationId: 'organization',
    formVersionId: 'version',
    formSectionId: sectionId,
    sortOrder: 1,
  };

  const sections = {
    findById: async (id: string) => {
      if (id === sectionId) return section;
      if (id === siblingSectionId) return siblingSection;
      return null;
    },
    findByVersionId: async () => [section, siblingSection],
    delete: async (id: string) => {
      assert.ok(insideTx, 'Must delete section inside transaction');
      writes.push({ deletedSection: id });
    },
    reorderItems: async (items: object[]) => {
      assert.ok(insideTx, 'Must reorder sections inside transaction');
      writes.push({ reorderedSections: items });
    },
  } as unknown as IFormSectionRepository;

  const fields = {
    findBySectionId: async (sId: string) => {
      if (sId === sectionId) return [field1, field2];
      return [];
    },
    delete: async (id: string) => {
      assert.ok(insideTx, 'Must delete fields inside transaction');
      writes.push({ deletedField: id });
    },
  } as unknown as IFormFieldRepository;

  const version = {
    organizationId: 'organization',
    formTemplateId: 'template',
    status,
  };
  const versions = {
    findById: async () => version,
  } as unknown as IFormVersionRepository;

  const uow: IUnitOfWork = {
    transaction: async (work) => {
      insideTx = true;
      try {
        return await work();
      } finally {
        insideTx = false;
      }
    },
  };

  return {
    useCase: new DeleteFormSectionUseCase(uow, versions, sections, fields),
    writes,
    sections,
    fields,
    versions,
  };
}

test('DeleteFormSectionUseCase: deletes fields, deletes section, and reorders remaining', async () => {
  const { useCase, writes } = fixture();
  await useCase.execute(ctx);

  assert.deepEqual(writes, [
    { deletedField: 'field-1' },
    { deletedField: 'field-2' },
    { deletedSection: sectionId },
    { reorderedSections: [{ id: siblingSectionId, sortOrder: 0 }] },
  ]);
});

test('DeleteFormSectionUseCase: throws if version is not draft', async () => {
  const { useCase } = fixture('PUBLISHED');
  await assert.rejects(
    async () => useCase.execute(ctx),
    /Only draft sections can be deleted/,
  );
});

test('DeleteFormSectionUseCase: throws if section not found', async () => {
  const { useCase } = fixture();
  await assert.rejects(
    async () => useCase.execute({ ...ctx, sectionId: 'unknown' }),
    /Form section not found/,
  );
});

test('DeleteFormSectionUseCase: throws if organization scope does not match', async () => {
  const { useCase } = fixture();
  await assert.rejects(
    async () =>
      useCase.execute({ ...ctx, activeOrganizationId: 'other-organization' }),
    /Permission does not apply to this organization/,
  );
});

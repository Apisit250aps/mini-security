import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { IUnitOfWork } from '@repo/domains';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IFormTemplateRepository,
  IFormVersionRepository,
  IFormSectionRepository,
  IFormFieldRepository,
} from '@repo/domains/repositories/form';
import type {
  FormTemplate,
  FormVersion,
  FormField,
  FormSection,
} from '@repo/domains/entities/form';
import {
  CreateFormTemplateUseCase,
  PublishFormVersionUseCase,
} from '../src/use-cases/form/form-template.usecase';

const companyId = '01a09d98-1063-71f9-8b24-db8753ff6d69';
const userId = '01a09d99-1db8-7357-8538-dac2c933fb03';
const memberId = '01a09d99-aaaa-7bbb-8ccc-dac2c933fb03';

function fixture() {
  const uow: IUnitOfWork = {
    transaction: async (fn) => fn(),
  };

  let createdTemplateData: Record<string, unknown> | null = null;
  let createdVersionData: Record<string, unknown> | null = null;
  let updatedVersionData: Record<string, unknown> | null = null;

  const templateRepo: IFormTemplateRepository = {
    create: async (data) => {
      createdTemplateData = data as Record<string, unknown>;
      return {
        id: '01a0aa39-945a-765f-8e79-9dfa19c10df8',
        ...data,
      } as unknown as FormTemplate;
    },
    findById: async () => null,
    findByIdAndCompany: async () => null,
    findByCompanyId: async () => [],
    update: async () => ({}) as unknown as FormTemplate,
    delete: async () => ({}) as unknown as FormTemplate,
  };

  const versionRepo: IFormVersionRepository = {
    create: async (data) => {
      createdVersionData = data as Record<string, unknown>;
      return {
        id: 'version-1',
        ...data,
      } as unknown as FormVersion;
    },
    findById: async () => null,
    findByTemplateId: async () => [],
    findDraftByTemplateId: async () =>
      ({
        id: 'version-1',
        companyId,
        formTemplateId: '01a0aa39-945a-765f-8e79-9dfa19c10df8',
        version: 1,
        status: 'DRAFT',
        title: 'Morning',
        createdBy: memberId,
        publishedBy: null,
        publishedAt: null,
      }) as FormVersion,
    findPublishedByTemplateId: async () => null,
    update: async (_id, data) => {
      updatedVersionData = data as Record<string, unknown>;
      return {
        id: 'version-1',
        ...data,
      } as unknown as FormVersion;
    },
  };

  const memberRepo: ICompanyMemberRepository = {
    findById: async (id: string) => {
      if (id === memberId) {
        return {
          id: memberId,
          companyId,
          userId,
          isActive: true,
        } as unknown as Awaited<ReturnType<ICompanyMemberRepository['findById']>>;
      }
      return null;
    },
    findByCompanyAndUser: async (cId: string, uId: string) => {
      if (cId === companyId && uId === userId) {
        return {
          id: memberId,
          companyId,
          userId,
          isActive: true,
        } as unknown as Awaited<ReturnType<ICompanyMemberRepository['findByCompanyAndUser']>>;
      }
      return null;
    },
  } as unknown as ICompanyMemberRepository;

  const sectionRepo: IFormSectionRepository = {
    findByVersionId: async () => [{ id: 'section-1' } as FormSection],
  } as unknown as IFormSectionRepository;

  const fieldRepo: IFormFieldRepository = {
    findByVersionId: async () => [
      {
        id: 'field-1',
        type: 'TEXT',
        isRequired: false,
        config: {},
      } as FormField,
    ],
    findByVersionIdWithOptions: async () => [
      {
        id: 'field-1',
        type: 'TEXT',
        isRequired: false,
        options: [],
      } as unknown as FormField,
    ],
  } as unknown as IFormFieldRepository;

  return {
    uow,
    templateRepo,
    versionRepo,
    memberRepo,
    sectionRepo,
    fieldRepo,
    getCreatedTemplateData: () => createdTemplateData,
    getCreatedVersionData: () => createdVersionData,
    getUpdatedVersionData: () => updatedVersionData,
  };
}

test('CreateFormTemplateUseCase resolves createdBy to memberId when given userId', async () => {
  const f = fixture();
  const useCase = new CreateFormTemplateUseCase(
    f.uow,
    f.templateRepo,
    f.versionRepo,
    f.memberRepo,
  );

  const res = await useCase.execute({
    user: { id: userId },
    activeCompanyId: companyId,
    permissions: 'form_template:create',
    data: {
      companyId,
      name: 'Morning Inspection',
      description: 'Morning check',
      isActive: true,
      createdBy: userId,
    },
  });

  assert.ok(res);
  const createdTemplate = f.getCreatedTemplateData();
  assert.equal(createdTemplate?.createdBy, memberId);

  const createdVersion = f.getCreatedVersionData();
  assert.equal(createdVersion?.createdBy, memberId);
});

test('CreateFormTemplateUseCase rejects if user is not an active company member', async () => {
  const f = fixture();
  const useCase = new CreateFormTemplateUseCase(
    f.uow,
    f.templateRepo,
    f.versionRepo,
    f.memberRepo,
  );

  await assert.rejects(
    async () => {
      await useCase.execute({
        user: { id: 'unknown-user' },
        activeCompanyId: companyId,
        permissions: 'form_template:create',
        data: {
          companyId,
          name: 'Morning Inspection',
          description: 'Morning check',
          isActive: true,
          createdBy: 'unknown-user',
        },
      });
    },
    {
      name: 'BadRequestError',
      message: 'Active company membership is required to create a template',
    },
  );
});

test('PublishFormVersionUseCase resolves publishedBy to memberId using findByCompanyAndUser', async () => {
  const f = fixture();
  const useCase = new PublishFormVersionUseCase(
    f.uow,
    f.versionRepo,
    f.sectionRepo,
    f.fieldRepo,
    f.memberRepo,
  );

  const res = await useCase.execute({
    user: { id: userId },
    activeCompanyId: companyId,
    permissions: 'form_template:publish',
    formTemplateId: '01a0aa39-945a-765f-8e79-9dfa19c10df8',
    memberId: '',
  });

  assert.ok(res);
  const updatedVersion = f.getUpdatedVersionData();
  assert.equal(updatedVersion?.publishedBy, memberId);
  assert.equal(updatedVersion?.status, 'PUBLISHED');
});

import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  FormSection,
  FormField,
  FormTemplate,
  FormTemplateRole,
  FormVersion,
} from '@repo/domains/entities/form';
import type {
  IAssignFormRolesContext,
  IAssignFormRolesUseCase,
  ICreateFormFieldContext,
  ICreateFormFieldUseCase,
  ICreateFormSectionContext,
  ICreateFormSectionUseCase,
  ICreateFormTemplateContext,
  ICreateFormTemplateUseCase,
  IGetFormTemplateContext,
  IGetFormTemplateUseCase,
  IListFormTemplatesByCompanyContext,
  IListFormTemplatesByCompanyUseCase,
  IPublishFormVersionContext,
  IPublishFormVersionUseCase,
  IUpdateFormTemplateContext,
  IUpdateFormTemplateUseCase,
  FormTemplateDetail,
} from '@repo/domains/applications/form';
import type {
  IFormFieldRepository,
  IFormSectionRepository,
  IFormTemplateRepository,
  IFormTemplateRoleRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import {
  createFormFieldSchema,
  createFormSectionSchema,
  createFormTemplateSchema,
  updateFormTemplateSchema,
} from '@repo/domains/schema/form';
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

// ==========================================
// 1. Create Form Template
// ==========================================

export class CreateFormTemplateUseCase implements ICreateFormTemplateUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
  ) {}

  @RequirePermission('form_template:create')
  async execute(context: ICreateFormTemplateContext): Promise<FormTemplate> {
    return this.unitOfWork.transaction(async () => {
      const parsed = await createFormTemplateSchema.safeParseAsync(
        context.data,
      );
      if (!parsed.success) {
        throw new ValidationError('Invalid form template data', parsed.error);
      }

      const template = await this.templateRepo.create(parsed.data);

      // Automatically initialize Version 1 as DRAFT
      await this.versionRepo.create({
        companyId: template.companyId,
        formTemplateId: template.id,
        version: 1,
        status: 'DRAFT',
        title: template.name,
        description: template.description ?? null,
        createdBy: template.createdBy,
        publishedBy: null,
        publishedAt: null,
      });

      return template;
    });
  }
}

// ==========================================
// 2. Update Form Template
// ==========================================

export class UpdateFormTemplateUseCase implements IUpdateFormTemplateUseCase {
  constructor(private readonly templateRepo: IFormTemplateRepository) {}

  @RequirePermission('form_template:update')
  async execute(context: IUpdateFormTemplateContext): Promise<FormTemplate> {
    const parsed = await updateFormTemplateSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid form template data', parsed.error);
    }

    const existing = await this.templateRepo.findById(context.id);
    if (!existing) {
      throw new NotFoundError('Form template not found');
    }

    return this.templateRepo.update(context.id, parsed.data);
  }
}

// ==========================================
// 3. Get Form Template With Details
// ==========================================

export class GetFormTemplateUseCase implements IGetFormTemplateUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly roleRepo: IFormTemplateRoleRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:read')
  async execute(
    context: IGetFormTemplateContext,
  ): Promise<FormTemplateDetail | null> {
    return this.unitOfWork.transaction(async () => {
      const template = await this.templateRepo.findById(context.id);
      if (!template) return null;

      const [publishedVersion, draftVersion, roles] = await Promise.all([
        this.versionRepo.findPublishedByTemplateId(template.id),
        this.versionRepo.findDraftByTemplateId(template.id),
        this.roleRepo.findByTemplateId(template.id),
      ]);

      // Active inspection version defaults to draft (for builder) or published
      const targetVersion = draftVersion ?? publishedVersion;

      const [sections, fields] = targetVersion
        ? await Promise.all([
            this.sectionRepo.findByVersionId(targetVersion.id),
            this.fieldRepo.findByVersionId(targetVersion.id),
          ])
        : [[], []];

      return {
        template,
        activeVersion: publishedVersion,
        draftVersion,
        roles,
        sections,
        fields,
      };
    });
  }
}

// ==========================================
// 4. List Form Templates By Company
// ==========================================

export class ListFormTemplatesByCompanyUseCase
  implements IListFormTemplatesByCompanyUseCase
{
  constructor(private readonly templateRepo: IFormTemplateRepository) {}

  @RequirePermission('form_template:read')
  async execute(
    context: IListFormTemplatesByCompanyContext,
  ): Promise<FormTemplate[]> {
    return this.templateRepo.findByCompanyId(context.companyId);
  }
}

// ==========================================
// 5. Assign Form Roles
// ==========================================

export class AssignFormRolesUseCase implements IAssignFormRolesUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly roleRepo: IFormTemplateRoleRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(context: IAssignFormRolesContext): Promise<FormTemplateRole[]> {
    return this.unitOfWork.transaction(async () => {
      const template = await this.templateRepo.findById(context.formTemplateId);
      if (!template) {
        throw new NotFoundError('Form template not found');
      }

      // Replace assignments
      await this.roleRepo.deleteByTemplateId(template.id);

      const created: FormTemplateRole[] = [];
      for (const roleId of context.roleIds) {
        const item = await this.roleRepo.create({
          companyId: template.companyId,
          formTemplateId: template.id,
          roleId,
          isEnabled: true,
        });
        created.push(item);
      }

      return created;
    });
  }
}

// ==========================================
// 6. Create Form Section
// ==========================================

export class CreateFormSectionUseCase implements ICreateFormSectionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(context: ICreateFormSectionContext): Promise<FormSection> {
    return this.unitOfWork.transaction(async () => {
      const parsed = await createFormSectionSchema.safeParseAsync(context.data);
      if (!parsed.success) {
        throw new ValidationError('Invalid form section data', parsed.error);
      }

      const version = await this.versionRepo.findById(
        parsed.data.formVersionId,
      );
      if (!version) {
        throw new NotFoundError('Form version not found');
      }
      if (version.status !== 'DRAFT') {
        throw new BadRequestError(
          'Cannot add sections to a published or archived form version',
        );
      }

      return this.sectionRepo.create(parsed.data);
    });
  }
}

// ==========================================
// 7. Create Form Field
// ==========================================

export class CreateFormFieldUseCase implements ICreateFormFieldUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(context: ICreateFormFieldContext): Promise<FormField> {
    return this.unitOfWork.transaction(async () => {
      const parsed = await createFormFieldSchema.safeParseAsync(context.data);
      if (!parsed.success) {
        throw new ValidationError('Invalid form field data', parsed.error);
      }

      const version = await this.versionRepo.findById(
        parsed.data.formVersionId,
      );
      if (!version) {
        throw new NotFoundError('Form version not found');
      }
      if (version.status !== 'DRAFT') {
        throw new BadRequestError(
          'Cannot add fields to a published or archived form version',
        );
      }

      return this.fieldRepo.create(parsed.data);
    });
  }
}

// ==========================================
// 8. Publish Form Version
// ==========================================

export class PublishFormVersionUseCase implements IPublishFormVersionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly roleRepo: IFormTemplateRoleRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:publish')
  async execute(context: IPublishFormVersionContext): Promise<FormVersion> {
    return this.unitOfWork.transaction(async () => {
      const draft = await this.versionRepo.findDraftByTemplateId(
        context.formTemplateId,
      );
      if (!draft) {
        throw new NotFoundError('No draft version found to publish');
      }

      // Verify requirements: at least 1 section, 1 field, and 1 assigned role
      const [roles, sections, fields] = await Promise.all([
        this.roleRepo.findByTemplateId(context.formTemplateId),
        this.sectionRepo.findByVersionId(draft.id),
        this.fieldRepo.findByVersionId(draft.id),
      ]);

      if (roles.length === 0) {
        throw new BadRequestError(
          'Cannot publish form without any role assignments',
        );
      }
      if (sections.length === 0) {
        throw new BadRequestError('Cannot publish form without any sections');
      }
      if (fields.length === 0) {
        throw new BadRequestError('Cannot publish form without any fields');
      }

      // Archive current published version if exists
      const currentPublished = await this.versionRepo.findPublishedByTemplateId(
        context.formTemplateId,
      );
      if (currentPublished) {
        await this.versionRepo.update(currentPublished.id, {
          status: 'ARCHIVED',
        });
      }

      // Mark draft as PUBLISHED
      return this.versionRepo.update(draft.id, {
        status: 'PUBLISHED',
        publishedBy: context.memberId,
        publishedAt: new Date(),
      });
    });
  }
}

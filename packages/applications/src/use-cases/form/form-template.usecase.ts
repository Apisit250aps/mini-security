import { validateFormFieldConfig } from './form-answer-validation';
import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  FormSection,
  FormField,
  FormTemplate,
  FormVersion,
} from '@repo/domains/entities/form';
import type {
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
  IFormFieldOptionRepository,
  IFormSectionRepository,
  IFormTemplateRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
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

/**
 * 1. Create Form Template
 */

export class CreateFormTemplateUseCase implements ICreateFormTemplateUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
    private readonly memberRepo?: ICompanyMemberRepository,
  ) {}

  @RequirePermission('form_template:create')
  async execute(context: ICreateFormTemplateContext): Promise<FormTemplate> {
    const companyId =
      context.companyId ?? context.activeCompanyId ?? context.data.companyId;
    if (!companyId) throw new BadRequestError('companyId is required');

    return this.unitOfWork.transaction(async () => {
      let createdBy: string | null = null;

      if (this.memberRepo) {
        let member = context.memberId
          ? await this.memberRepo.findById(context.memberId)
          : null;
        if (
          (!member || !member.isActive || member.companyId !== companyId) &&
          context.user?.id
        ) {
          member = await this.memberRepo.findByCompanyAndUser(
            companyId,
            context.user.id,
          );
        }
        if (
          (!member || !member.isActive || member.companyId !== companyId) &&
          context.data?.createdBy
        ) {
          const maybeMember = await this.memberRepo.findById(
            context.data.createdBy,
          );
          if (
            maybeMember &&
            maybeMember.isActive &&
            maybeMember.companyId === companyId
          ) {
            member = maybeMember;
          } else {
            const maybeUserMember = await this.memberRepo.findByCompanyAndUser(
              companyId,
              context.data.createdBy,
            );
            if (
              maybeUserMember &&
              maybeUserMember.isActive &&
              maybeUserMember.companyId === companyId
            ) {
              member = maybeUserMember;
            }
          }
        }
        if (member && member.isActive && member.companyId === companyId) {
          createdBy = member.id;
        }
      } else {
        createdBy = context.memberId ?? context.data.createdBy;
      }

      if (!createdBy) {
        throw new BadRequestError(
          'Active company membership is required to create a template',
        );
      }

      const parsed = await createFormTemplateSchema.safeParseAsync({
        ...context.data,
        companyId,
        createdBy,
      });
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

/**
 * 2. Update Form Template
 */

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

/**
 * 3. Get Form Template With Details
 */

export class GetFormTemplateUseCase implements IGetFormTemplateUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly templateRepo: IFormTemplateRepository,
    private readonly versionRepo: IFormVersionRepository,
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

      const [publishedVersion, draftVersion] = await Promise.all([
        this.versionRepo.findPublishedByTemplateId(template.id),
        this.versionRepo.findDraftByTemplateId(template.id),
      ]);

      // Active inspection version defaults to draft (for builder) or published
      const targetVersion = draftVersion ?? publishedVersion;

      const [sections, fields] = targetVersion
        ? await Promise.all([
            this.sectionRepo.findByVersionId(targetVersion.id),
            this.fieldRepo.findByVersionIdWithOptions(targetVersion.id),
          ])
        : [[], []];

      return {
        template,
        activeVersion: publishedVersion,
        draftVersion,
        sections,
        fields,
      };
    });
  }
}

/**
 * 4. List Form Templates By Company
 */

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

/**
 * 6. Create Form Section
 */

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

/**
 * 7. Create Form Field
 */

export class CreateFormFieldUseCase implements ICreateFormFieldUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly optionRepo?: IFormFieldOptionRepository,
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

      await validateFormFieldConfig(parsed.data);
      const { options, ...fieldData } = parsed.data;
      const field = await this.fieldRepo.create(fieldData);
      const savedOptions =
        this.optionRepo && options !== undefined
          ? await this.optionRepo.replaceOptions(
              field.id,
              field.companyId,
              field.formVersionId,
              options,
            )
          : [];
      return new FormField({ ...field, options: savedOptions });
    });
  }
}

/**
 * 8. Publish Form Version
 */

export class PublishFormVersionUseCase implements IPublishFormVersionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly memberRepo?: ICompanyMemberRepository,
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

      // Verify requirements: at least 1 section, 1 field
      const [sections, fields] = await Promise.all([
        this.sectionRepo.findByVersionId(draft.id),
        this.fieldRepo.findByVersionIdWithOptions(draft.id),
      ]);

      if (sections.length === 0) {
        throw new BadRequestError('Cannot publish form without any sections');
      }
      if (fields.length === 0) {
        throw new BadRequestError('Cannot publish form without any fields');
      }

      for (const field of fields) await validateFormFieldConfig(field);

      // Archive current published version if exists
      const currentPublished = await this.versionRepo.findPublishedByTemplateId(
        context.formTemplateId,
      );
      if (currentPublished) {
        await this.versionRepo.update(currentPublished.id, {
          status: 'ARCHIVED',
        });
      }

      const companyId =
        context.companyId ?? context.activeCompanyId ?? draft.companyId;
      let publishedBy: string | null = null;

      if (this.memberRepo) {
        let member = context.memberId
          ? await this.memberRepo.findById(context.memberId)
          : null;
        if (
          (!member || !member.isActive || member.companyId !== companyId) &&
          context.user?.id
        ) {
          member = await this.memberRepo.findByCompanyAndUser(
            companyId,
            context.user.id,
          );
        }
        if (member && member.isActive && member.companyId === companyId) {
          publishedBy = member.id;
        }
      } else {
        publishedBy = context.memberId;
      }

      if (!publishedBy) {
        throw new BadRequestError(
          'Active company membership is required to publish a form version',
        );
      }

      // Mark draft as PUBLISHED
      return this.versionRepo.update(draft.id, {
        status: 'PUBLISHED',
        publishedBy,
        publishedAt: new Date(),
      });
    });
  }
}

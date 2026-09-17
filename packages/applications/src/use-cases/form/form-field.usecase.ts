import { validateFormFieldConfig } from './form-answer-validation';
import type { IUnitOfWork } from '@repo/domains';
import type {
  IDeleteFormFieldContext,
  IDeleteFormFieldUseCase,
  IEditFormFieldContext,
  IEditFormFieldUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormFieldRepository,
  IFormVersionRepository,
  IFormSectionRepository,
} from '@repo/domains/repositories/form';
import { editFormFieldSchema } from '@repo/domains/schema/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { BadRequestError, ValidationError } from '../../lib/error';
import { loadDraftFormEntity } from './form-guards';

async function loadDraftField(
  ctx: IDeleteFormFieldContext,
  fields: IFormFieldRepository,
  versions: IFormVersionRepository,
) {
  return loadDraftFormEntity(
    ctx,
    ctx.fieldId,
    (id) => fields.findById(id),
    versions,
    'field',
  );
}

export class EditFormFieldUseCase implements IEditFormFieldUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
    private readonly sectionRepo: IFormSectionRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IEditFormFieldContext) {
    const parsed = await editFormFieldSchema.safeParseAsync(ctx.data);
    if (!parsed.success)
      throw new ValidationError('Invalid form field', parsed.error);
    return this.unitOfWork.transaction(async () => {
      const field = await loadDraftField(ctx, this.fieldRepo, this.versionRepo);
      const section = await this.sectionRepo.findById(
        parsed.data.formSectionId,
      );
      if (
        !section ||
        section.formVersionId !== field.formVersionId ||
        section.companyId !== field.companyId
      )
        throw new BadRequestError(
          'Section must belong to the same draft version',
        );
      await validateFormFieldConfig(parsed.data);
      let sortOrder = field.sortOrder;
      if (field.formSectionId !== section.id) {
        const fields = await this.fieldRepo.findByVersionId(
          field.formVersionId,
        );
        const remaining = fields
          .filter(
            (item) =>
              item.formSectionId === field.formSectionId &&
              item.id !== field.id,
          )
          .sort((a, b) => a.sortOrder - b.sortOrder);
        await this.fieldRepo.reorderItems(
          remaining.map((item, index) => ({ id: item.id, sortOrder: index })),
        );
        const destination = fields
          .filter((item) => item.formSectionId === section.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        await this.fieldRepo.reorderItems(
          destination.map((item, index) => ({ id: item.id, sortOrder: index })),
        );
        sortOrder = destination.length;
      }
      return this.fieldRepo.update(field.id, { ...parsed.data, sortOrder });
    });
  }
}

export class DeleteFormFieldUseCase implements IDeleteFormFieldUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IDeleteFormFieldContext): Promise<void> {
    await this.unitOfWork.transaction(async () => {
      const field = await loadDraftField(ctx, this.fieldRepo, this.versionRepo);
      await this.fieldRepo.delete(field.id);
      const fields = await this.fieldRepo.findByVersionId(field.formVersionId);
      const remaining = fields
        .filter(
          (item) =>
            item.formSectionId === field.formSectionId && item.id !== field.id,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder);
      await this.fieldRepo.reorderItems(
        remaining.map((item, sortOrder) => ({ id: item.id, sortOrder })),
      );
    });
  }
}

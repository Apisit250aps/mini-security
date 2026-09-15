import type { IUnitOfWork } from '@repo/domains';
import type {
  IReorderFormFieldsContext,
  IReorderFormFieldsUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormFieldRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import { reorderFormItemsSchema } from '@repo/domains/schema/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { PermissionGuard } from '../../lib/guard';
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class ReorderFormFieldUseCase implements IReorderFormFieldsUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IReorderFormFieldsContext): Promise<void> {
    const parsed = await reorderFormItemsSchema.safeParseAsync(ctx);
    if (!parsed.success)
      throw new ValidationError('Invalid reorder data', parsed.error);
    await this.unitOfWork.transaction(async () => {
      const { formVersionId, items } = parsed.data;
      const version = await this.versionRepo.findById(formVersionId);
      if (!version || version.formTemplateId !== ctx.formTemplateId) {
        throw new NotFoundError('Form version not found for this template');
      }
      PermissionGuard.requireCompanyScope(ctx, version.companyId);
      if (version.status !== 'DRAFT') {
        throw new BadRequestError('Only draft versions can be reordered');
      }
      const records = await this.fieldRepo.findByVersionId(version.id);
      const requestedIds = new Set(items.map((item) => item.id));
      if (
        items.some(
          (item) =>
            !records.some(
              (record) =>
                record.id === item.id && record.companyId === version.companyId,
            ),
        )
      ) {
        throw new BadRequestError('Reorder items must belong to this version');
      }
      const sectionId = records.find((record) =>
        requestedIds.has(record.id),
      )?.formSectionId;
      const siblings = records.filter(
        (record) => record.formSectionId === sectionId,
      );
      if (
        siblings.length !== items.length ||
        siblings.some((record) => !requestedIds.has(record.id))
      ) {
        throw new BadRequestError(
          'Reorder must include every item in the same section',
        );
      }
      await this.fieldRepo.reorderItems(items);
    });
  }
}

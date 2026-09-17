import type { IUnitOfWork } from '@repo/domains';
import type {
  IReorderFormFieldsContext,
  IReorderFormFieldsUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormFieldRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { validateAndReorderFormItems } from './form-reorder';

export class ReorderFormFieldUseCase implements IReorderFormFieldsUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IReorderFormFieldsContext): Promise<void> {
    await this.unitOfWork.transaction(async () => {
      await validateAndReorderFormItems({
        ctx,
        versionRepo: this.versionRepo,
        itemRepo: this.fieldRepo,
        data: ctx,
        siblingKey: (record) => record.formSectionId,
        groupErrorMessage:
          'Reorder must include every item in the same section',
      });
    });
  }
}

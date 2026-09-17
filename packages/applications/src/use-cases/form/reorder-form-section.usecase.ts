import type { IUnitOfWork } from '@repo/domains';
import type {
  IReorderFormSectionsContext,
  IReorderFormSectionsUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormSectionRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { validateAndReorderFormItems } from './form-reorder';

export class ReorderFormSectionUseCase implements IReorderFormSectionsUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IReorderFormSectionsContext): Promise<void> {
    await this.unitOfWork.transaction(async () => {
      await validateAndReorderFormItems({
        ctx,
        versionRepo: this.versionRepo,
        itemRepo: this.sectionRepo,
        data: ctx,
        groupErrorMessage:
          'Reorder must include every item in the same version',
      });
    });
  }
}

import type { IUnitOfWork } from '@repo/domains';
import type {
  IDeleteFormSectionContext,
  IDeleteFormSectionUseCase,
} from '@repo/domains/applications/form';
import type {
  IFormFieldRepository,
  IFormSectionRepository,
  IFormVersionRepository,
} from '@repo/domains/repositories/form';
import { RequirePermission } from '../../decorators/permission.decorator';
import { loadDraftFormEntity } from './form-guards';

async function loadDraftSection(
  ctx: IDeleteFormSectionContext,
  sections: IFormSectionRepository,
  versions: IFormVersionRepository,
) {
  return loadDraftFormEntity(
    ctx,
    ctx.sectionId,
    (id) => sections.findById(id),
    versions,
    'section',
    'Only draft sections can be deleted',
  );
}

export class DeleteFormSectionUseCase implements IDeleteFormSectionUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly versionRepo: IFormVersionRepository,
    private readonly sectionRepo: IFormSectionRepository,
    private readonly fieldRepo: IFormFieldRepository,
  ) {}

  @RequirePermission('form_template:update')
  async execute(ctx: IDeleteFormSectionContext): Promise<void> {
    await this.unitOfWork.transaction(async () => {
      const section = await loadDraftSection(
        ctx,
        this.sectionRepo,
        this.versionRepo,
      );

      // 1. Delete all fields belonging to this section first (due to DB FK onDelete restrict)
      const fields = await this.fieldRepo.findBySectionId(section.id);
      for (const field of fields) {
        await this.fieldRepo.delete(field.id);
      }

      // 2. Delete the section
      await this.sectionRepo.delete(section.id);

      // 3. Reorder remaining sections in this draft version
      const allSections = await this.sectionRepo.findByVersionId(
        section.formVersionId,
      );
      const remaining = allSections
        .filter((item) => item.id !== section.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      await this.sectionRepo.reorderItems(
        remaining.map((item, sortOrder) => ({ id: item.id, sortOrder })),
      );
    });
  }
}

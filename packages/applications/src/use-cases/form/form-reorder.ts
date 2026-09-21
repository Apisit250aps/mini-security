import type { ISecurityContext } from '@repo/domains/constants';
import type { IFormVersionRepository } from '@repo/domains/repositories/form';
import { reorderFormItemsSchema } from '@repo/domains/schema/form';
import { PermissionGuard } from '../../lib/guard';
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

interface ReorderableRecord {
  id: string;
  organizationId: string;
}

interface ReorderRepository<T extends ReorderableRecord> {
  findByVersionId(versionId: string): Promise<T[]>;
  reorderItems(items: Array<{ id: string; sortOrder: number }>): Promise<void>;
}

/**
 * Shared reorder validation + execution used by field/section reorder use cases:
 * validates the version, scope, draft status, membership, and sibling-group completeness.
 */
export async function validateAndReorderFormItems<
  T extends ReorderableRecord,
>(params: {
  ctx: ISecurityContext & { formTemplateId: string };
  versionRepo: IFormVersionRepository;
  itemRepo: ReorderRepository<T>;
  data: unknown;
  /** Groups siblings that must fully cover the reordered set (e.g. same section for fields). */
  siblingKey?: (record: T) => unknown;
  groupErrorMessage: string;
}): Promise<void> {
  const { ctx, versionRepo, itemRepo, data, siblingKey, groupErrorMessage } =
    params;
  const parsed = await reorderFormItemsSchema.safeParseAsync(data);
  if (!parsed.success)
    throw new ValidationError('Invalid reorder data', parsed.error);

  const { formVersionId, items } = parsed.data;
  const version = await versionRepo.findById(formVersionId);
  if (!version || version.formTemplateId !== ctx.formTemplateId) {
    throw new NotFoundError('Form version not found for this template');
  }
  PermissionGuard.requireOrganizationScope(ctx, version.organizationId);
  if (version.status !== 'DRAFT') {
    throw new BadRequestError('Only draft versions can be reordered');
  }

  const records = await itemRepo.findByVersionId(version.id);
  const requestedIds = new Set(items.map((item) => item.id));
  if (
    items.some(
      (item) =>
        !records.some(
          (record) =>
            record.id === item.id &&
            record.organizationId === version.organizationId,
        ),
    )
  ) {
    throw new BadRequestError('Reorder items must belong to this version');
  }

  const siblings = siblingKey
    ? (() => {
        const anchor = records.find((record) => requestedIds.has(record.id));
        const key = anchor ? siblingKey(anchor) : undefined;
        return records.filter((record) => siblingKey(record) === key);
      })()
    : records;

  if (
    siblings.length !== items.length ||
    siblings.some((record) => !requestedIds.has(record.id))
  ) {
    throw new BadRequestError(groupErrorMessage);
  }

  await itemRepo.reorderItems(items);
}

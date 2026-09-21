import type { ISecurityContext } from '@repo/domains/constants';
import type { IFormVersionRepository } from '@repo/domains/repositories/form';
import { PermissionGuard } from '../../lib/guard';
import { BadRequestError, NotFoundError } from '../../lib/error';

interface DraftFormRecord {
  id: string;
  organizationId: string;
  formVersionId: string;
}

/**
 * Shared "load a draft-scoped form field/section" pattern: loads the record, enforces
 * organization scope, verifies it belongs to the given template's version, and requires DRAFT status.
 */
export async function loadDraftFormEntity<T extends DraftFormRecord>(
  ctx: ISecurityContext & { formTemplateId: string },
  entityId: string,
  finder: (id: string) => Promise<T | null | undefined>,
  versions: IFormVersionRepository,
  entityLabel: string,
  draftStatusMessage = `Only draft ${entityLabel}s can be edited or deleted`,
): Promise<T> {
  const entity = await finder(entityId);
  if (!entity) throw new NotFoundError(`Form ${entityLabel} not found`);
  PermissionGuard.requireOrganizationScope(ctx, entity.organizationId);
  const version = await versions.findById(entity.formVersionId);
  if (
    !version ||
    version.formTemplateId !== ctx.formTemplateId ||
    version.organizationId !== entity.organizationId
  )
    throw new NotFoundError(`Form ${entityLabel} not found for this template`);
  if (version.status !== 'DRAFT') throw new BadRequestError(draftStatusMessage);
  return entity;
}

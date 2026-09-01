'use server';
import { getMyPermissionsUseCase } from '@/shared/compositions/applications/permission/role-permission.application';
import type { Permission } from '@repo/domains/entities';
import { Session } from '../hooks/session-provider';

async function getPermissions(session: Session): Promise<Permission[]> {
  let permissions: Permission[] = [];
  if (session) {
    if (!session.user.isAdmin) {
      permissions = await getMyPermissionsUseCase.execute({
        companyId: session.session.activeCompanyId!,
        userId: session.session.userId,
      });
      permissions = permissions.map((p) => ({ ...p }));
    }
  }
  return permissions;
}

export { getPermissions };

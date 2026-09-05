import 'server-only';
import { getUserPermissionActions } from '@repo/infrastructures/lib/auth-permissions';
import { getMyPermissionsUseCase } from '@repo/infrastructures/compositions';
import type { Permission } from '@repo/domains/entities';
import { Session } from '../hooks/session-provider';

async function getPermissions(session: Session): Promise<Permission[]> {
  let permissions: Permission[] = [];
  if (session) {
    if (!session.user.isAdmin) {
      const { actions, companyId } = await getUserPermissionActions(
        session.user.id,
        session.session.activeCompanyId,
      );
      permissions = await getMyPermissionsUseCase.execute({
        companyId: companyId ?? undefined,
        activeCompanyId: companyId,
        user: session.user,
        permissions: actions.join(','),
        userId: session.session.userId,
      });
      permissions = permissions.map((p) => ({ ...p }));
    }
  }
  return permissions;
}

export { getPermissions };

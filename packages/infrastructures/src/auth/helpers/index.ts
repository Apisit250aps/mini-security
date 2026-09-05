import {
  permission,
  companyMember,
  rolePermission,
  user,
} from '@repo/database';
import db from '@repo/database/db';
import { eq, and } from 'drizzle-orm';

async function getAllPermissionActions(): Promise<string[]> {
  const result = await db
    .selectDistinct({
      action: permission.action,
    })
    .from(permission);

  return result.map((r) => r.action);
}

async function getUserPermissionActions(
  userId: string,
): Promise<{ actions: string[]; companyId: string | null }> {
  const result = await db.transaction(async (tx) => {
    const [m] = await tx
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(
        and(eq(companyMember.userId, userId), eq(companyMember.isActive, true)),
      )
      .limit(1);

    const [u] = await tx
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return { member: m, user: u };
  });

  if (result.user?.isAdmin) {
    const allActions = await getAllPermissionActions();
    return { actions: allActions, companyId: null };
  }

  const actionsResult = await db
    .selectDistinct({
      action: permission.action,
    })
    .from(companyMember)
    .innerJoin(rolePermission, eq(companyMember.roleId, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(
      and(
        eq(companyMember.userId, userId),
        eq(companyMember.companyId, result.member?.companyId ?? ''),
        eq(companyMember.isActive, true),
      ),
    );

  return {
    actions: actionsResult.map((r) => r.action),
    companyId: result.member?.companyId ?? null,
  };
}

export { getUserPermissionActions, getAllPermissionActions };

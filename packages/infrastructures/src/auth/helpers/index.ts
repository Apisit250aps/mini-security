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
  activeCompanyId?: string | null,
): Promise<{
  actions: string[];
  companyId: string | null;
  memberId: string | null;
}> {
  const result = await db.transaction(async (tx) => {
    const [m] = await tx
      .select({ id: companyMember.id, companyId: companyMember.companyId })
      .from(companyMember)
      .where(
        and(
          eq(companyMember.userId, userId),
          eq(companyMember.isActive, true),
          activeCompanyId
            ? eq(companyMember.companyId, activeCompanyId)
            : undefined,
        ),
      )
      .limit(1);

    const [u] = await tx
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return { member: m, user: u };
  });

  if (!result.user?.isActive)
    return { actions: [], companyId: null, memberId: null };

  if (result.user?.isAdmin) {
    const allActions = await getAllPermissionActions();
    return {
      actions: allActions,
      companyId: activeCompanyId ?? null,
      memberId: result.member?.id ?? null,
    };
  }

  if (!result.member) return { actions: [], companyId: null, memberId: null };

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
        eq(companyMember.companyId, result.member.companyId),
        eq(companyMember.isActive, true),
      ),
    );

  return {
    actions: actionsResult.map((r) => r.action),
    companyId: result.member?.companyId ?? null,
    memberId: result.member?.id ?? null,
  };
}

export { getUserPermissionActions };

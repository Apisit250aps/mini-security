import {
  permission,
  organizationMember,
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
  activeOrganizationId?: string | null,
): Promise<{
  actions: string[];
  organizationId: string | null;
  memberId: string | null;
}> {
  const result = await db.transaction(async (tx) => {
    const [m] = await tx
      .select({
        id: organizationMember.id,
        organizationId: organizationMember.organizationId,
      })
      .from(organizationMember)
      .where(
        and(
          eq(organizationMember.userId, userId),
          eq(organizationMember.isActive, true),
          activeOrganizationId
            ? eq(organizationMember.organizationId, activeOrganizationId)
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
    return { actions: [], organizationId: null, memberId: null };

  if (result.user?.isAdmin) {
    const allActions = await getAllPermissionActions();
    return {
      actions: allActions,
      organizationId: activeOrganizationId ?? null,
      memberId: result.member?.id ?? null,
    };
  }

  if (!result.member)
    return { actions: [], organizationId: null, memberId: null };

  const actionsResult = await db
    .selectDistinct({
      action: permission.action,
    })
    .from(organizationMember)
    .innerJoin(
      rolePermission,
      eq(organizationMember.roleId, rolePermission.roleId),
    )
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .where(
      and(
        eq(organizationMember.userId, userId),
        eq(organizationMember.organizationId, result.member.organizationId),
        eq(organizationMember.isActive, true),
      ),
    );

  return {
    actions: actionsResult.map((r) => r.action),
    organizationId: result.member?.organizationId ?? null,
    memberId: result.member?.id ?? null,
  };
}

export { getUserPermissionActions };

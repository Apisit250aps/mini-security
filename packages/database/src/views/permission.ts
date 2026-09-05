import { pgView } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import { companyMember, rolePermission, permission, role } from '../schema'; // ปรับ path ตามโปรเจกต์

export const userPermissionsView = pgView('user_permissions_view').as((qb) =>
  qb
    .select({
      userId: companyMember.userId,
      companyId: companyMember.companyId,
      companyBranchId: companyMember.companyBranchId,
      roleId: companyMember.roleId,
      roleName: role.name,
      permissionId: permission.id,
      action: permission.action,
      module: permission.module,
      isMemberActive: companyMember.isActive,
    })
    .from(companyMember)
    .innerJoin(role, eq(companyMember.roleId, role.id))
    .innerJoin(rolePermission, eq(companyMember.roleId, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id)),
);

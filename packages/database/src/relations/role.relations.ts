import type { RelationsHelper } from './types';

export const roleRelations = (r: RelationsHelper) => ({
  company: {
    roles: r.many.role(),
    companyFeatures: r.many.companyFeature(),
    roleFeatures: r.many.roleFeature(),
  },
  role: {
    company: r.one.company({
      from: r.role.companyId,
      to: r.company.id,
    }),
    rolePermissions: r.many.rolePermission(),
    roleFeatures: r.many.roleFeature(),
    members: r.many.companyMember(),
  },
  permission: {
    rolePermissions: r.many.rolePermission(),
    feature: r.one.feature({
      from: r.permission.featureId,
      to: r.feature.id,
    }),
  },
  rolePermission: {
    role: r.one.role({
      from: r.rolePermission.roleId,
      to: r.role.id,
    }),
    permission: r.one.permission({
      from: r.rolePermission.permissionId,
      to: r.permission.id,
    }),
  },
  feature: {
    companyFeatures: r.many.companyFeature(),
    roleFeatures: r.many.roleFeature(),
    permissions: r.many.permission(),
  },
  companyFeature: {
    company: r.one.company({
      from: r.companyFeature.companyId,
      to: r.company.id,
    }),
    feature: r.one.feature({
      from: r.companyFeature.featureId,
      to: r.feature.id,
    }),
    assignedByUser: r.one.user({
      from: r.companyFeature.assignedBy,
      to: r.user.id,
    }),
  },
  roleFeature: {
    company: r.one.company({
      from: r.roleFeature.companyId,
      to: r.company.id,
    }),
    role: r.one.role({
      from: r.roleFeature.roleId,
      to: r.role.id,
    }),
    feature: r.one.feature({
      from: r.roleFeature.featureId,
      to: r.feature.id,
    }),
  },
});

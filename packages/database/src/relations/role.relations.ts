import type { RelationsHelper } from './types';

export const roleRelations = (r: RelationsHelper) => ({
  organization: {
    roles: r.many.role(),
    organizationFeatures: r.many.organizationFeature(),
    roleFeatures: r.many.roleFeature(),
  },
  role: {
    organization: r.one.organization({
      from: r.role.organizationId,
      to: r.organization.id,
    }),
    rolePermissions: r.many.rolePermission(),
    roleFeatures: r.many.roleFeature(),
    members: r.many.organizationMember(),
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
    organizationFeatures: r.many.organizationFeature(),
    roleFeatures: r.many.roleFeature(),
    permissions: r.many.permission(),
  },
  organizationFeature: {
    organization: r.one.organization({
      from: r.organizationFeature.organizationId,
      to: r.organization.id,
    }),
    feature: r.one.feature({
      from: r.organizationFeature.featureId,
      to: r.feature.id,
    }),
    assignedByUser: r.one.user({
      from: r.organizationFeature.assignedBy,
      to: r.user.id,
    }),
  },
  roleFeature: {
    organization: r.one.organization({
      from: r.roleFeature.organizationId,
      to: r.organization.id,
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

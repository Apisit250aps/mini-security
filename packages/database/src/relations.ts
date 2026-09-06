import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    memberships: r.many.companyMember(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  company: {
    members: r.many.companyMember(),
    roles: r.many.role(),
    companyFeatures: r.many.companyFeature(),
    roleFeatures: r.many.roleFeature(),
  },
  companyBranch: {
    company: r.one.company({
      from: r.companyBranch.companyId,
      to: r.company.id,
    }),
    members: r.many.companyMember(),
  },
  companyMember: {
    company: r.one.company({
      from: r.companyMember.companyId,
      to: r.company.id,
    }),
    user: r.one.user({
      from: r.companyMember.userId,
      to: r.user.id,
    }),
    role: r.one.role({
      from: r.companyMember.roleId,
      to: r.role.id,
    }),
    branch: r.one.companyBranch({
      from: r.companyMember.companyBranchId,
      to: r.companyBranch.id,
    }),
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
}));

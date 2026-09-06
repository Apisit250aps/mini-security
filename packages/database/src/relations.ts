import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    memberships: r.many.companyMember(),
    recordedAttendanceLogs: r.many.attendanceLogs(),
    reviewedLeaveRequests: r.many.leaveRequests(),
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
    checkInSchedules: r.many.checkInSchedules(),
    leaveTypes: r.many.leaveTypes(),
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
    attendanceLogs: r.many.attendanceLogs(),
    leaveQuotas: r.many.leaveQuotas(),
    leaveRequests: r.many.leaveRequests(),
  },
  role: {
    company: r.one.company({
      from: r.role.companyId,
      to: r.company.id,
    }),
    rolePermissions: r.many.rolePermission(),
    roleFeatures: r.many.roleFeature(),
    members: r.many.companyMember(),
    checkInSchedule: r.one.checkInSchedules({
      from: r.role.id,
      to: r.checkInSchedules.roleId,
    }),
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
  checkInSchedules: {
    role: r.one.role({
      from: r.checkInSchedules.roleId,
      to: r.role.id,
    }),
    company: r.one.company({
      from: r.checkInSchedules.companyId,
      to: r.company.id,
    }),
    slots: r.many.scheduleSlots(),
  },
  scheduleSlots: {
    schedule: r.one.checkInSchedules({
      from: r.scheduleSlots.checkInScheduleId,
      to: r.checkInSchedules.id,
    }),
    attendanceLogs: r.many.attendanceLogs(),
  },
  attendanceLogs: {
    member: r.one.companyMember({
      from: r.attendanceLogs.companyMemberId,
      to: r.companyMember.id,
    }),
    slot: r.one.scheduleSlots({
      from: r.attendanceLogs.scheduleSlotId,
      to: r.scheduleSlots.id,
    }),
    recordedByUser: r.one.user({
      from: r.attendanceLogs.recordedBy,
      to: r.user.id,
    }),
  },
  leaveTypes: {
    company: r.one.company({
      from: r.leaveTypes.companyId,
      to: r.company.id,
    }),
    quotas: r.many.leaveQuotas(),
    requests: r.many.leaveRequests(),
  },
  leaveQuotas: {
    member: r.one.companyMember({
      from: r.leaveQuotas.companyMemberId,
      to: r.companyMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveQuotas.leaveTypeId,
      to: r.leaveTypes.id,
    }),
  },
  leaveRequests: {
    member: r.one.companyMember({
      from: r.leaveRequests.companyMemberId,
      to: r.companyMember.id,
    }),
    leaveType: r.one.leaveTypes({
      from: r.leaveRequests.leaveTypeId,
      to: r.leaveTypes.id,
    }),
    reviewedByUser: r.one.user({
      from: r.leaveRequests.reviewedBy,
      to: r.user.id,
    }),
  },
}));

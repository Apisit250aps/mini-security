import { defineRelationsPart } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelationsPart(schema, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    memberships: r.many.companyMember(),
    approvedAttendanceRecords: r.many.attendanceRecord(),
    reviewedLeaveRequests: r.many.leaveRequest(),
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
    workSchedules: r.many.workSchedule(),
    workShifts: r.many.workShift(),
    attendancePolicies: r.many.attendancePolicy(),
    attendanceLocations: r.many.attendanceLocation(),
    attendanceRecords: r.many.attendanceRecord(),
    leaveRequests: r.many.leaveRequest(),
  },
  companyBranch: {
    company: r.one.company({
      from: r.companyBranch.companyId,
      to: r.company.id,
    }),
    members: r.many.companyMember(),
    attendanceLocations: r.many.attendanceLocation(),
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
    workSchedules: r.many.memberWorkSchedule(),
    attendanceRecords: r.many.attendanceRecord(),
    leaveRequests: r.many.leaveRequest(),
  },
  role: {
    company: r.one.company({
      from: r.role.companyId,
      to: r.company.id,
    }),
    rolePermissions: r.many.rolePermission(),
    members: r.many.companyMember(),
    roleAttendancePolicies: r.many.roleAttendancePolicy(),
  },
  permission: {
    rolePermissions: r.many.rolePermission(),
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
  workSchedule: {
    company: r.one.company({
      from: r.workSchedule.companyId,
      to: r.company.id,
    }),
    shifts: r.many.workShift(),
  },
  workShift: {
    workSchedule: r.one.workSchedule({
      from: r.workShift.workScheduleId,
      to: r.workSchedule.id,
    }),
    company: r.one.company({
      from: r.workShift.companyId,
      to: r.company.id,
    }),
    memberWorkSchedules: r.many.memberWorkSchedule(),
    attendanceRecords: r.many.attendanceRecord(),
  },
  attendancePolicy: {
    company: r.one.company({
      from: r.attendancePolicy.companyId,
      to: r.company.id,
    }),
    checkpoints: r.many.attendanceCheckpoint(),
    roleAttendancePolicies: r.many.roleAttendancePolicy(),
  },
  attendanceCheckpoint: {
    policy: r.one.attendancePolicy({
      from: r.attendanceCheckpoint.policyId,
      to: r.attendancePolicy.id,
    }),
    checkpointLocations: r.many.checkpointLocation(),
    attendanceLogs: r.many.attendanceLog(),
  },
  roleAttendancePolicy: {
    role: r.one.role({
      from: r.roleAttendancePolicy.roleId,
      to: r.role.id,
    }),
    policy: r.one.attendancePolicy({
      from: r.roleAttendancePolicy.policyId,
      to: r.attendancePolicy.id,
    }),
    company: r.one.company({
      from: r.roleAttendancePolicy.companyId,
      to: r.company.id,
    }),
  },
  attendanceLocation: {
    company: r.one.company({
      from: r.attendanceLocation.companyId,
      to: r.company.id,
    }),
    branch: r.one.companyBranch({
      from: r.attendanceLocation.branchId,
      to: r.companyBranch.id,
    }),
    checkpointLocations: r.many.checkpointLocation(),
    attendanceLogs: r.many.attendanceLog(),
  },
  checkpointLocation: {
    checkpoint: r.one.attendanceCheckpoint({
      from: r.checkpointLocation.checkpointId,
      to: r.attendanceCheckpoint.id,
    }),
    location: r.one.attendanceLocation({
      from: r.checkpointLocation.locationId,
      to: r.attendanceLocation.id,
    }),
  },
  memberWorkSchedule: {
    member: r.one.companyMember({
      from: r.memberWorkSchedule.companyMemberId,
      to: r.companyMember.id,
    }),
    workShift: r.one.workShift({
      from: r.memberWorkSchedule.workShiftId,
      to: r.workShift.id,
    }),
  },
  attendanceRecord: {
    company: r.one.company({
      from: r.attendanceRecord.companyId,
      to: r.company.id,
    }),
    member: r.one.companyMember({
      from: r.attendanceRecord.companyMemberId,
      to: r.companyMember.id,
    }),
    workShift: r.one.workShift({
      from: r.attendanceRecord.workShiftId,
      to: r.workShift.id,
    }),
    approvedByUser: r.one.user({
      from: r.attendanceRecord.approvedBy,
      to: r.user.id,
    }),
    logs: r.many.attendanceLog(),
  },
  attendanceLog: {
    record: r.one.attendanceRecord({
      from: r.attendanceLog.attendanceRecordId,
      to: r.attendanceRecord.id,
    }),
    checkpoint: r.one.attendanceCheckpoint({
      from: r.attendanceLog.checkpointId,
      to: r.attendanceCheckpoint.id,
    }),
    location: r.one.attendanceLocation({
      from: r.attendanceLog.locationId,
      to: r.attendanceLocation.id,
    }),
  },
  leaveRequest: {
    company: r.one.company({
      from: r.leaveRequest.companyId,
      to: r.company.id,
    }),
    member: r.one.companyMember({
      from: r.leaveRequest.companyMemberId,
      to: r.companyMember.id,
    }),
    reviewedByUser: r.one.user({
      from: r.leaveRequest.reviewedBy,
      to: r.user.id,
    }),
  },
}));

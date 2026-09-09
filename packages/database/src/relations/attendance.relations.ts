import type { RelationsHelper } from './types';

export const attendanceRelations = (r: RelationsHelper) => ({
  company: {
    checkInSchedules: r.many.checkInSchedules(),
  },
  role: {
    checkInSchedule: r.one.checkInSchedules({
      from: r.role.id,
      to: r.checkInSchedules.roleId,
    }),
  },
  companyMember: {
    attendanceLogs: r.many.attendanceLogs(),
  },
  user: {
    recordedAttendanceLogs: r.many.attendanceLogs(),
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
});

import type { RelationsHelper } from './types';

export const attendanceRelations = (r: RelationsHelper) => ({
  organization: {
    checkInSchedules: r.many.checkInSchedules(),
  },
  role: {
    checkInScheduleRoles: r.many.checkInScheduleRoles(),
  },
  organizationMember: {
    attendanceLogs: r.many.attendanceLogs(),
  },
  user: {
    recordedAttendanceLogs: r.many.attendanceLogs(),
  },
  checkInSchedules: {
    roleAssignments: r.many.checkInScheduleRoles(),
    organization: r.one.organization({
      from: r.checkInSchedules.organizationId,
      to: r.organization.id,
    }),
    slots: r.many.scheduleSlots(),
  },
  checkInScheduleRoles: {
    schedule: r.one.checkInSchedules({
      from: [
        r.checkInScheduleRoles.checkInScheduleId,
        r.checkInScheduleRoles.organizationId,
      ],
      to: [r.checkInSchedules.id, r.checkInSchedules.organizationId],
    }),
    role: r.one.role({
      from: r.checkInScheduleRoles.roleId,
      to: r.role.id,
    }),
  },
  scheduleSlots: {
    schedule: r.one.checkInSchedules({
      from: r.scheduleSlots.checkInScheduleId,
      to: r.checkInSchedules.id,
    }),
    locations: r.many.scheduleSlotLocation(),
    attendanceLogs: r.many.attendanceLogs(),
  },
  attendanceLogs: {
    member: r.one.organizationMember({
      from: r.attendanceLogs.organizationMemberId,
      to: r.organizationMember.id,
    }),
    slot: r.one.scheduleSlots({
      from: r.attendanceLogs.scheduleSlotId,
      to: r.scheduleSlots.id,
    }),
    location: r.one.locations({
      from: [r.attendanceLogs.locationId, r.attendanceLogs.organizationId],
      to: [r.locations.id, r.locations.organizationId],
    }),
    recordedByUser: r.one.user({
      from: r.attendanceLogs.recordedBy,
      to: r.user.id,
    }),
  },
});

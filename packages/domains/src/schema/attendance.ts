import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  DateField,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
} from '#lib/entity';

// ==========================================
// Enums
// ==========================================

export const AttendanceStatusValues = [
  'present',
  'absent',
  'late',
  'excused',
] as const;

export type AttendanceStatus = (typeof AttendanceStatusValues)[number];

// ==========================================
// 1. Check-In Schedule Schema
// ==========================================

export const checkInScheduleSchema = BaseEntity({
  roleId: UUIDField({ required: true }),
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCheckInScheduleSchema = checkInScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCheckInScheduleSchema = checkInScheduleSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CheckInScheduleEntity = z.infer<typeof checkInScheduleSchema>;
export type CreateCheckInSchedule = z.infer<typeof createCheckInScheduleSchema>;
export type UpdateCheckInSchedule = z.infer<typeof updateCheckInScheduleSchema>;

// ==========================================
// 2. Schedule Slot Schema
// ==========================================

export const scheduleSlotSchema = BaseEntity({
  checkInScheduleId: UUIDField({ required: true }),
  slotOrder: NumberField({ required: true }),
  label: StringField({ required: true }),
  windowStart: StringField({ required: true, max: 10 }), // e.g. "07:00:00"
  windowEnd: StringField({ required: true, max: 10 }), // e.g. "09:00:00"
  isRequired: BooleanField({ default: () => true }),
});

export const createScheduleSlotSchema = scheduleSlotSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateScheduleSlotSchema = scheduleSlotSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type ScheduleSlotEntity = z.infer<typeof scheduleSlotSchema>;
export type CreateScheduleSlot = z.infer<typeof createScheduleSlotSchema>;
export type UpdateScheduleSlot = z.infer<typeof updateScheduleSlotSchema>;

// ==========================================
// 3. Attendance Log Schema
// ==========================================

export const attendanceLogSchema = BaseEntity({
  companyMemberId: UUIDField({ required: true }),
  scheduleSlotId: UUIDField({ required: true }),
  workDate: StringField({ required: true, max: 10 }), // "YYYY-MM-DD"
  checkedInAt: DateField({ required: false, nullable: true }),
  status: EnumField(AttendanceStatusValues, { default: () => 'absent' }),
  note: StringField({ required: false, nullable: true, max: 500 }),
  recordedBy: UUIDField({ required: false, nullable: true }),
});

export const createAttendanceLogSchema = attendanceLogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAttendanceLogSchema = attendanceLogSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AttendanceLogEntity = z.infer<typeof attendanceLogSchema>;
export type CreateAttendanceLog = z.infer<typeof createAttendanceLogSchema>;
export type UpdateAttendanceLog = z.infer<typeof updateAttendanceLogSchema>;

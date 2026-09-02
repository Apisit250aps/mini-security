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
// Enum Definitions
// ==========================================

export const CHECK_TYPES = [
  'CHECK_IN',
  'CHECK_OUT',
  'BREAK_IN',
  'BREAK_OUT',
  'CUSTOM',
] as const satisfies readonly string[];
export type CheckType = (typeof CHECK_TYPES)[number];

export const ATTENDANCE_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'LATE',
  'ABSENT',
] as const satisfies readonly string[];
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const LOCATION_TYPES = [
  'FIXED',
  'RADIUS',
  'BRANCH',
] as const satisfies readonly string[];
export type LocationType = (typeof LOCATION_TYPES)[number];

export const LEAVE_TYPES = [
  'SICK_LEAVE',
  'ANNUAL_LEAVE',
  'PERSONAL_LEAVE',
  'MATERNITY_LEAVE',
  'ABSENT_NO_REASON',
] as const satisfies readonly string[];
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const satisfies readonly string[];
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

// ==========================================
// 1. Work Schedule & Shift
// ==========================================

export const workScheduleSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  description: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createWorkScheduleSchema = workScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWorkScheduleSchema = workScheduleSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type WorkScheduleEntity = z.infer<typeof workScheduleSchema>;
export type CreateWorkSchedule = z.infer<typeof createWorkScheduleSchema>;
export type UpdateWorkSchedule = z.infer<typeof updateWorkScheduleSchema>;

export const workShiftSchema = BaseEntity({
  workScheduleId: UUIDField({ required: true }),
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  startTime: StringField({ required: true }),
  endTime: StringField({ required: true }),
  isOvernight: BooleanField({ default: () => false }),
  color: StringField({ required: false, nullable: true }),
});

export const createWorkShiftSchema = workShiftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWorkShiftSchema = workShiftSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type WorkShiftEntity = z.infer<typeof workShiftSchema>;
export type CreateWorkShift = z.infer<typeof createWorkShiftSchema>;
export type UpdateWorkShift = z.infer<typeof updateWorkShiftSchema>;

// ==========================================
// 2. Attendance Policy & Checkpoint
// ==========================================

export const attendancePolicySchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  description: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createAttendancePolicySchema = attendancePolicySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAttendancePolicySchema = attendancePolicySchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AttendancePolicyEntity = z.infer<typeof attendancePolicySchema>;
export type CreateAttendancePolicy = z.infer<
  typeof createAttendancePolicySchema
>;
export type UpdateAttendancePolicy = z.infer<
  typeof updateAttendancePolicySchema
>;

export const attendanceCheckpointSchema = BaseEntity({
  policyId: UUIDField({ required: true }),
  checkType: EnumField(CHECK_TYPES, { default: () => 'CHECK_IN' as CheckType }),
  label: StringField({ required: true }),
  orderIndex: NumberField({ default: () => 0 }),
  isRequired: BooleanField({ default: () => true }),
  windowStart: StringField({ required: false, nullable: true }),
  windowEnd: StringField({ required: false, nullable: true }),
  graceMinutes: NumberField({
    required: false,
    nullable: true,
    default: () => 0,
  }),
  requirePhoto: BooleanField({ default: () => true }),
  requireLocation: BooleanField({ default: () => true }),
});

export const createAttendanceCheckpointSchema = attendanceCheckpointSchema.omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const updateAttendanceCheckpointSchema = attendanceCheckpointSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AttendanceCheckpointEntity = z.infer<
  typeof attendanceCheckpointSchema
>;
export type CreateAttendanceCheckpoint = z.infer<
  typeof createAttendanceCheckpointSchema
>;
export type UpdateAttendanceCheckpoint = z.infer<
  typeof updateAttendanceCheckpointSchema
>;

export const roleAttendancePolicySchema = BaseEntity({
  roleId: UUIDField({ required: true }),
  policyId: UUIDField({ required: true }),
  companyId: UUIDField({ required: true }),
});

export const createRoleAttendancePolicySchema = roleAttendancePolicySchema.omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export const updateRoleAttendancePolicySchema = roleAttendancePolicySchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type RoleAttendancePolicyEntity = z.infer<
  typeof roleAttendancePolicySchema
>;
export type CreateRoleAttendancePolicy = z.infer<
  typeof createRoleAttendancePolicySchema
>;
export type UpdateRoleAttendancePolicy = z.infer<
  typeof updateRoleAttendancePolicySchema
>;

// ==========================================
// 3. Attendance Location
// ==========================================

export const attendanceLocationSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  branchId: UUIDField({ required: false, nullable: true }),
  name: StringField({ required: true }),
  locationType: EnumField(LOCATION_TYPES, {
    default: () => 'RADIUS' as LocationType,
  }),
  latitude: NumberField({ required: false, nullable: true }),
  longitude: NumberField({ required: false, nullable: true }),
  radiusMeters: NumberField({ required: false, nullable: true }),
  address: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createAttendanceLocationSchema = attendanceLocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAttendanceLocationSchema = attendanceLocationSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AttendanceLocationEntity = z.infer<typeof attendanceLocationSchema>;
export type CreateAttendanceLocation = z.infer<
  typeof createAttendanceLocationSchema
>;
export type UpdateAttendanceLocation = z.infer<
  typeof updateAttendanceLocationSchema
>;

export const checkpointLocationSchema = BaseEntity({
  checkpointId: UUIDField({ required: true }),
  locationId: UUIDField({ required: true }),
});

export const createCheckpointLocationSchema = checkpointLocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCheckpointLocationSchema = checkpointLocationSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CheckpointLocationEntity = z.infer<typeof checkpointLocationSchema>;
export type CreateCheckpointLocation = z.infer<
  typeof createCheckpointLocationSchema
>;
export type UpdateCheckpointLocation = z.infer<
  typeof updateCheckpointLocationSchema
>;

// ==========================================
// 4. Role Work Schedule
// ==========================================

export const roleWorkScheduleSchema = BaseEntity({
  roleId: UUIDField({ required: true }),
  companyId: UUIDField({ required: true }),
  workShiftId: UUIDField({ required: true }),
  effectiveDate: DateField({ required: true }),
  endDate: DateField({ required: false, nullable: true }),
});

export const createRoleWorkScheduleSchema = roleWorkScheduleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleWorkScheduleSchema = roleWorkScheduleSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type RoleWorkScheduleEntity = z.infer<typeof roleWorkScheduleSchema>;
export type CreateRoleWorkSchedule = z.infer<
  typeof createRoleWorkScheduleSchema
>;
export type UpdateRoleWorkSchedule = z.infer<
  typeof updateRoleWorkScheduleSchema
>;

// ==========================================
// 5. Attendance Record (Daily Header)
// ==========================================

export const attendanceRecordSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  companyMemberId: UUIDField({ required: true }),
  workShiftId: UUIDField({ required: true }),
  workDate: DateField({ required: true }),
  status: EnumField(ATTENDANCE_STATUSES, {
    default: () => 'PENDING' as AttendanceStatus,
  }),
  totalWorkMinutes: NumberField({ required: false, nullable: true }),
  overtimeMinutes: NumberField({
    required: false,
    nullable: true,
    default: () => 0,
  }),
  lateMinutes: NumberField({
    required: false,
    nullable: true,
    default: () => 0,
  }),
  note: StringField({ required: false, nullable: true }),
  approvedBy: UUIDField({ required: false, nullable: true }),
  approvedAt: DateField({ required: false, nullable: true }),
});

export const createAttendanceRecordSchema = attendanceRecordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAttendanceRecordSchema = attendanceRecordSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AttendanceRecordEntity = z.infer<typeof attendanceRecordSchema>;
export type CreateAttendanceRecord = z.infer<
  typeof createAttendanceRecordSchema
>;
export type UpdateAttendanceRecord = z.infer<
  typeof updateAttendanceRecordSchema
>;

// ==========================================
// 6. Attendance Log (Check-in Event)
// ==========================================

export const attendanceLogSchema = BaseEntity({
  attendanceRecordId: UUIDField({ required: true }),
  checkpointId: UUIDField({ required: true }),
  checkType: EnumField(CHECK_TYPES, { required: true }),
  checkedAt: DateField({ default: () => new Date() }),
  latitude: NumberField({ required: false, nullable: true }),
  longitude: NumberField({ required: false, nullable: true }),
  accuracyMeters: NumberField({ required: false, nullable: true }),
  locationId: UUIDField({ required: false, nullable: true }),
  isLocationValid: BooleanField({ default: () => false }),
  photoUrl: StringField({ required: false, nullable: true }),
  photoVerified: BooleanField({ default: () => false }),
  deviceId: StringField({ required: false, nullable: true }),
  ipAddress: StringField({ required: false, nullable: true }),
  isManual: BooleanField({ default: () => false }),
  manualReason: StringField({ required: false, nullable: true }),
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

// ==========================================
// 7. Leave Request
// ==========================================

export const leaveRequestSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  companyMemberId: UUIDField({ required: true }),
  leaveType: EnumField(LEAVE_TYPES, { required: true }),
  status: EnumField(LEAVE_STATUSES, {
    default: () => 'PENDING' as LeaveStatus,
  }),
  startDate: DateField({ required: true }),
  endDate: DateField({ required: true }),
  totalDays: NumberField({ required: true }),
  reason: StringField({ required: false, nullable: true }),
  attachmentUrl: StringField({ required: false, nullable: true }),
  reviewedBy: UUIDField({ required: false, nullable: true }),
  reviewedAt: DateField({ required: false, nullable: true }),
  reviewNote: StringField({ required: false, nullable: true }),
});

export const createLeaveRequestSchema = leaveRequestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeaveRequestSchema = leaveRequestSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type LeaveRequestEntity = z.infer<typeof leaveRequestSchema>;
export type CreateLeaveRequest = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequest = z.infer<typeof updateLeaveRequestSchema>;

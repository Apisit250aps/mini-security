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

export const LeaveRequestStatusValues = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
] as const;

export type LeaveRequestStatus = (typeof LeaveRequestStatusValues)[number];

export const LeaveUnitValues = ['day', 'half_day', 'hour'] as const;

export type LeaveUnit = (typeof LeaveUnitValues)[number];

// ==========================================
// 1. Leave Type Schema
// ==========================================

export const leaveTypeSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  unit: EnumField(LeaveUnitValues, { default: () => 'day' }),
  requiresProof: BooleanField({ default: () => false }),
  maxDaysPerYear: NumberField({ required: false, nullable: true }),
  isPaid: BooleanField({ default: () => true }),
  isActive: BooleanField({ default: () => true }),
});

export const createLeaveTypeSchema = leaveTypeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeaveTypeSchema = leaveTypeSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type LeaveTypeEntity = z.infer<typeof leaveTypeSchema>;
export type CreateLeaveType = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveType = z.infer<typeof updateLeaveTypeSchema>;

// ==========================================
// 2. Leave Quota Schema
// ==========================================

export const leaveQuotaSchema = BaseEntity({
  companyMemberId: UUIDField({ required: true }),
  leaveTypeId: UUIDField({ required: true }),
  year: NumberField({ required: true }),
  totalDays: NumberField({ required: true }).refine(
    (days) => days >= 0,
    'Total days must be non-negative',
  ),
});

export const createLeaveQuotaSchema = leaveQuotaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeaveQuotaSchema = leaveQuotaSchema
  .partial()
  .omit({
    id: true,
    companyMemberId: true,
    leaveTypeId: true,
    year: true,
    createdAt: true,
    updatedAt: true,
  })
  .strict();

export type LeaveQuotaEntity = z.infer<typeof leaveQuotaSchema>;
export type CreateLeaveQuota = z.infer<typeof createLeaveQuotaSchema>;
export type UpdateLeaveQuota = z.infer<typeof updateLeaveQuotaSchema>;

// ==========================================
// 3. Leave Request Schema
// ==========================================

export const leaveRequestSchema = BaseEntity({
  companyMemberId: UUIDField({ required: true }),
  leaveTypeId: UUIDField({ required: true }),
  startDate: StringField({ required: true, max: 10 }), // "YYYY-MM-DD"
  endDate: StringField({ required: true, max: 10 }), // "YYYY-MM-DD"
  unit: EnumField(LeaveUnitValues, { default: () => 'day' }),
  startTime: StringField({ required: false, nullable: true, max: 10 }),
  endTime: StringField({ required: false, nullable: true, max: 10 }),
  minutesPerDaySnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (val) => val == null || (val > 0 && val <= 1440),
    'Minutes per day snapshot must be between 1 and 1440',
  ),
  reason: StringField({ required: true, max: 1000 }),
  proofUrl: StringField({ required: false, nullable: true, max: 2048 }),
  status: EnumField(LeaveRequestStatusValues, { default: () => 'pending' }),
  reviewedBy: UUIDField({ required: false, nullable: true }),
  reviewedAt: DateField({ required: false, nullable: true }),
  reviewNote: StringField({ required: false, nullable: true, max: 1000 }),
})
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.unit === 'day') {
        return (
          data.startTime == null &&
          data.endTime == null &&
          data.minutesPerDaySnapshot == null
        );
      }
      if (data.unit === 'half_day') {
        return (
          data.startDate === data.endDate &&
          data.startTime != null &&
          data.endTime != null &&
          data.endTime > data.startTime &&
          data.minutesPerDaySnapshot == null
        );
      }
      if (data.unit === 'hour') {
        return (
          data.startDate === data.endDate &&
          data.startTime != null &&
          data.endTime != null &&
          data.endTime > data.startTime &&
          data.minutesPerDaySnapshot != null
        );
      }
      return true;
    },
    {
      message:
        'Leave request timing must match unit specifications (day, half_day, or hour)',
      path: ['unit'],
    },
  );

export const createLeaveRequestSchema = BaseEntity({
  companyMemberId: UUIDField({ required: true }),
  leaveTypeId: UUIDField({ required: true }),
  startDate: StringField({ required: true, max: 10 }),
  endDate: StringField({ required: true, max: 10 }),
  unit: EnumField(LeaveUnitValues, { default: () => 'day' }),
  startTime: StringField({ required: false, nullable: true, max: 10 }),
  endTime: StringField({ required: false, nullable: true, max: 10 }),
  minutesPerDaySnapshot: NumberField({
    required: false,
    nullable: true,
  }).refine(
    (val) => val == null || (val > 0 && val <= 1440),
    'Minutes per day snapshot must be between 1 and 1440',
  ),
  reason: StringField({ required: true, max: 1000 }),
  proofUrl: StringField({ required: false, nullable: true, max: 2048 }),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.unit === 'day') {
        return (
          data.startTime == null &&
          data.endTime == null &&
          data.minutesPerDaySnapshot == null
        );
      }
      if (data.unit === 'half_day') {
        return (
          data.startDate === data.endDate &&
          data.startTime != null &&
          data.endTime != null &&
          data.endTime > data.startTime &&
          data.minutesPerDaySnapshot == null
        );
      }
      if (data.unit === 'hour') {
        return (
          data.startDate === data.endDate &&
          data.startTime != null &&
          data.endTime != null &&
          data.endTime > data.startTime &&
          data.minutesPerDaySnapshot != null
        );
      }
      return true;
    },
    {
      message:
        'Leave request timing must match unit specifications (day, half_day, or hour)',
      path: ['unit'],
    },
  );

export const updateLeaveRequestSchema = z
  .object({
    status: EnumField(LeaveRequestStatusValues, { required: false }),
    reviewedBy: UUIDField({ required: false, nullable: true }),
    reviewedAt: DateField({ required: false, nullable: true }),
    reviewNote: StringField({ required: false, nullable: true, max: 1000 }),
    reason: StringField({ required: false, max: 1000 }),
    proofUrl: StringField({ required: false, nullable: true, max: 2048 }),
  })
  .partial()
  .strict();

export type LeaveRequestEntity = z.infer<typeof leaveRequestSchema>;
export type CreateLeaveRequest = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequest = z.infer<typeof updateLeaveRequestSchema>;

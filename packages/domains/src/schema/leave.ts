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
  totalDays: NumberField({ required: true }),
  usedDays: NumberField({ default: () => 0 }),
});

export const createLeaveQuotaSchema = leaveQuotaSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeaveQuotaSchema = leaveQuotaSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

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
  totalDays: NumberField({ required: true }),
  unit: EnumField(LeaveUnitValues, { default: () => 'day' }),
  reason: StringField({ required: true, max: 1000 }),
  proofUrl: StringField({ required: false, nullable: true, max: 2048 }),
  status: EnumField(LeaveRequestStatusValues, { default: () => 'pending' }),
  reviewedBy: UUIDField({ required: false, nullable: true }),
  reviewedAt: DateField({ required: false, nullable: true }),
  reviewNote: StringField({ required: false, nullable: true, max: 1000 }),
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

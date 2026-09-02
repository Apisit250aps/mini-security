import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { company, companyBranch, companyMember } from './company';
import { role } from './permission';
import { user } from './user';

// ==========================================
// Enums
// ==========================================

export const checkTypeEnum = pgEnum('check_type', [
  'CHECK_IN',
  'CHECK_OUT',
  'BREAK_IN',
  'BREAK_OUT',
  'CUSTOM',
]);

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'LATE',
  'ABSENT',
]);

export const locationTypeEnum = pgEnum('location_type', [
  'FIXED',
  'RADIUS',
  'BRANCH',
]);

export const leaveTypeEnum = pgEnum('leave_type', [
  'SICK_LEAVE',
  'ANNUAL_LEAVE',
  'PERSONAL_LEAVE',
  'MATERNITY_LEAVE',
  'ABSENT_NO_REASON',
]);

export const leaveStatusEnum = pgEnum('leave_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
]);

// ==========================================
// MODULE 1: Work Schedule & Shift
// ==========================================

export const workSchedule = pgTable(
  'work_schedule',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('work_schedule_company_id_idx').on(table.companyId)],
);

export const workShift = pgTable(
  'work_shift',
  {
    id: primaryKeyUuid7('id'),
    workScheduleId: uuid('work_schedule_id')
      .notNull()
      .references(() => workSchedule.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    isOvernight: boolean('is_overnight').default(false).notNull(),
    color: text('color'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('work_shift_schedule_id_idx').on(table.workScheduleId),
    index('work_shift_company_id_idx').on(table.companyId),
  ],
);

// ==========================================
// MODULE 2: Attendance Checkpoint Policy
// ==========================================

export const attendancePolicy = pgTable(
  'attendance_policy',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('attendance_policy_company_id_idx').on(table.companyId)],
);

export const attendanceCheckpoint = pgTable(
  'attendance_checkpoint',
  {
    id: primaryKeyUuid7('id'),
    policyId: uuid('policy_id')
      .notNull()
      .references(() => attendancePolicy.id, { onDelete: 'cascade' }),
    checkType: checkTypeEnum('check_type').notNull(),
    label: text('label').notNull(),
    orderIndex: integer('order_index').default(0).notNull(),
    isRequired: boolean('is_required').default(true).notNull(),
    windowStart: time('window_start'),
    windowEnd: time('window_end'),
    graceMinutes: integer('grace_minutes').default(0),
    requirePhoto: boolean('require_photo').default(true).notNull(),
    requireLocation: boolean('require_location').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('checkpoint_policy_id_idx').on(table.policyId),
    index('checkpoint_type_idx').on(table.checkType),
  ],
);

export const roleAttendancePolicy = pgTable(
  'role_attendance_policy',
  {
    id: primaryKeyUuid7('id'),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    policyId: uuid('policy_id')
      .notNull()
      .references(() => attendancePolicy.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('role_att_policy_role_idx').on(table.roleId),
    index('role_att_policy_policy_idx').on(table.policyId),
    uniqueIndex('role_att_policy_unique_idx').on(table.roleId, table.policyId),
  ],
);

// ==========================================
// MODULE 3: Attendance Location
// ==========================================

export const attendanceLocation = pgTable(
  'attendance_location',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id').references(() => companyBranch.id),
    name: text('name').notNull(),
    locationType: locationTypeEnum('location_type').default('RADIUS').notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 8 }),
    longitude: numeric('longitude', { precision: 11, scale: 8 }),
    radiusMeters: integer('radius_meters'),
    address: text('address'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('att_location_company_id_idx').on(table.companyId),
    index('att_location_branch_id_idx').on(table.branchId),
  ],
);

export const checkpointLocation = pgTable(
  'checkpoint_location',
  {
    id: primaryKeyUuid7('id'),
    checkpointId: uuid('checkpoint_id')
      .notNull()
      .references(() => attendanceCheckpoint.id, { onDelete: 'cascade' }),
    locationId: uuid('location_id')
      .notNull()
      .references(() => attendanceLocation.id, { onDelete: 'cascade' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('chk_loc_checkpoint_idx').on(table.checkpointId),
    index('chk_loc_location_idx').on(table.locationId),
    uniqueIndex('chk_loc_unique_idx').on(table.checkpointId, table.locationId),
  ],
);

// ==========================================
// MODULE 4: Member Work Schedule Assignment
// ==========================================

export const memberWorkSchedule = pgTable(
  'member_work_schedule',
  {
    id: primaryKeyUuid7('id'),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    workShiftId: uuid('work_shift_id')
      .notNull()
      .references(() => workShift.id),
    effectiveDate: date('effective_date', { mode: 'date' }).notNull(),
    endDate: date('end_date', { mode: 'date' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('member_schedule_member_idx').on(table.companyMemberId),
    index('member_schedule_shift_idx').on(table.workShiftId),
    index('member_schedule_date_idx').on(table.effectiveDate),
  ],
);

// ==========================================
// MODULE 5: Daily Attendance Record
// ==========================================

export const attendanceRecord = pgTable(
  'attendance_record',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    workShiftId: uuid('work_shift_id')
      .notNull()
      .references(() => workShift.id),
    workDate: date('work_date', { mode: 'date' }).notNull(),
    status: attendanceStatusEnum('status').default('PENDING').notNull(),
    totalWorkMinutes: integer('total_work_minutes'),
    overtimeMinutes: integer('overtime_minutes').default(0),
    lateMinutes: integer('late_minutes').default(0),
    note: text('note'),
    approvedBy: uuid('approved_by').references(() => user.id),
    approvedAt: timestamp('approved_at'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('att_record_company_idx').on(table.companyId),
    index('att_record_member_idx').on(table.companyMemberId),
    index('att_record_date_idx').on(table.workDate),
    uniqueIndex('att_record_member_date_unique').on(
      table.companyMemberId,
      table.workDate,
    ),
  ],
);

// ==========================================
// MODULE 6: Attendance Log
// ==========================================

export const attendanceLog = pgTable(
  'attendance_log',
  {
    id: primaryKeyUuid7('id'),
    attendanceRecordId: uuid('attendance_record_id')
      .notNull()
      .references(() => attendanceRecord.id, { onDelete: 'cascade' }),
    checkpointId: uuid('checkpoint_id')
      .notNull()
      .references(() => attendanceCheckpoint.id),
    checkType: checkTypeEnum('check_type').notNull(),
    checkedAt: timestamp('checked_at').notNull(),
    latitude: numeric('latitude', { precision: 10, scale: 8 }),
    longitude: numeric('longitude', { precision: 11, scale: 8 }),
    accuracyMeters: numeric('accuracy_meters', { precision: 6, scale: 2 }),
    locationId: uuid('location_id').references(() => attendanceLocation.id),
    isLocationValid: boolean('is_location_valid').default(false).notNull(),
    photoUrl: text('photo_url'),
    photoVerified: boolean('photo_verified').default(false).notNull(),
    deviceId: text('device_id'),
    ipAddress: text('ip_address'),
    isManual: boolean('is_manual').default(false).notNull(),
    manualReason: text('manual_reason'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('att_log_record_idx').on(table.attendanceRecordId),
    index('att_log_checkpoint_idx').on(table.checkpointId),
    index('att_log_checked_at_idx').on(table.checkedAt),
    uniqueIndex('att_log_record_checkpoint_unique').on(
      table.attendanceRecordId,
      table.checkpointId,
    ),
  ],
);

// ==========================================
// MODULE 7: Leave Request
// ==========================================

export const leaveRequest = pgTable(
  'leave_request',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    leaveType: leaveTypeEnum('leave_type').notNull(),
    status: leaveStatusEnum('status').default('PENDING').notNull(),
    startDate: date('start_date', { mode: 'date' }).notNull(),
    endDate: date('end_date', { mode: 'date' }).notNull(),
    totalDays: numeric('total_days', { precision: 4, scale: 1 }).notNull(),
    reason: text('reason'),
    attachmentUrl: text('attachment_url'),
    reviewedBy: uuid('reviewed_by').references(() => user.id),
    reviewedAt: timestamp('reviewed_at'),
    reviewNote: text('review_note'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('leave_req_company_idx').on(table.companyId),
    index('leave_req_member_idx').on(table.companyMemberId),
    index('leave_req_start_date_idx').on(table.startDate),
    index('leave_req_status_idx').on(table.status),
  ],
);

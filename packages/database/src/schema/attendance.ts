import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { company, companyMember } from './company';
import { role } from './permission';
import { user } from './user';

// ==========================================
// Enums
// ==========================================

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'excused',
]);

// ==========================================
// 1. Check-In Schedules Table
// ==========================================

export const checkInSchedules = pgTable(
  'check_in_schedules',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('check_in_schedule_id_company_unique').on(table.id, table.companyId),
    index('check_in_schedule_company_id_idx').on(table.companyId),
  ],
);

export const checkInScheduleRoles = pgTable(
  'check_in_schedule_roles',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id').notNull(),
    checkInScheduleId: uuid('check_in_schedule_id').notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    unique('check_in_schedule_role_pair_unique').on(
      table.checkInScheduleId,
      table.roleId,
    ),
    index('check_in_schedule_role_company_role_idx').on(
      table.companyId,
      table.roleId,
    ),
    foreignKey({
      columns: [table.checkInScheduleId, table.companyId],
      foreignColumns: [checkInSchedules.id, checkInSchedules.companyId],
    }).onDelete('cascade'),
  ],
);

// ==========================================
// 2. Schedule Slots Table
// ==========================================

export const scheduleSlots = pgTable(
  'schedule_slots',
  {
    id: primaryKeyUuid7('id'),
    checkInScheduleId: uuid('check_in_schedule_id')
      .notNull()
      .references(() => checkInSchedules.id, { onDelete: 'cascade' }),
    slotOrder: integer('slot_order').notNull(),
    label: text('label').notNull(),
    windowStart: time('window_start').notNull(),
    windowEnd: time('window_end').notNull(),
    isRequired: boolean('is_required').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('schedule_slot_schedule_id_idx').on(table.checkInScheduleId),
    unique('schedule_slot_order_unique').on(
      table.checkInScheduleId,
      table.slotOrder,
    ),
  ],
);

// ==========================================
// 3. Attendance Logs Table
// ==========================================

export const attendanceLogs = pgTable(
  'attendance_logs',
  {
    id: primaryKeyUuid7('id'),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    scheduleSlotId: uuid('schedule_slot_id')
      .notNull()
      .references(() => scheduleSlots.id, { onDelete: 'restrict' }),
    workDate: date('work_date').notNull(),
    checkedInAt: timestamp('checked_in_at'),
    status: attendanceStatusEnum('status').default('absent').notNull(),
    note: text('note'),
    recordedBy: uuid('recorded_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('attendance_log_member_id_idx').on(table.companyMemberId),
    index('attendance_log_slot_id_idx').on(table.scheduleSlotId),
    index('attendance_log_work_date_idx').on(table.workDate),
    unique('attendance_log_unique_per_slot_per_day').on(
      table.companyMemberId,
      table.scheduleSlotId,
      table.workDate,
    ),
  ],
);

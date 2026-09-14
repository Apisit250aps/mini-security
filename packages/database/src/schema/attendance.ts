import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  doublePrecision,
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
import { locations } from './location';

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
    companyId: uuid('company_id').notNull(),
    checkInScheduleId: uuid('check_in_schedule_id').notNull(),
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
    unique('schedule_slots_id_company_unique').on(table.id, table.companyId),
    unique('schedule_slot_order_unique').on(
      table.checkInScheduleId,
      table.slotOrder,
    ),
    foreignKey({
      columns: [table.checkInScheduleId, table.companyId],
      foreignColumns: [checkInSchedules.id, checkInSchedules.companyId],
    }).onDelete('cascade'),
  ],
);

// ==========================================
// 3. Schedule Slot Location Table
// ==========================================

export const scheduleSlotLocation = pgTable(
  'schedule_slot_location',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id').notNull(),
    scheduleSlotId: uuid('schedule_slot_id').notNull(),
    locationId: uuid('location_id').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('schedule_slot_location_slot_loc_unique').on(
      table.scheduleSlotId,
      table.locationId,
    ),
    unique('schedule_slot_location_slot_loc_company_unique').on(
      table.scheduleSlotId,
      table.locationId,
      table.companyId,
    ),
    index('schedule_slot_location_loc_company_idx').on(
      table.locationId,
      table.companyId,
    ),
    index('schedule_slot_location_company_slot_active_idx').on(
      table.companyId,
      table.scheduleSlotId,
      table.isActive,
    ),
    foreignKey({
      columns: [table.scheduleSlotId, table.companyId],
      foreignColumns: [scheduleSlots.id, scheduleSlots.companyId],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.locationId, table.companyId],
      foreignColumns: [locations.id, locations.companyId],
    }).onDelete('restrict'),
  ],
);

// ==========================================
// 4. Attendance Logs Table
// ==========================================

export const attendanceLogs = pgTable(
  'attendance_logs',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id').notNull(),
    companyMemberId: uuid('company_member_id').notNull(),
    scheduleSlotId: uuid('schedule_slot_id').notNull(),
    workDate: date('work_date').notNull(),
    checkedInAt: timestamp('checked_in_at'),
    status: attendanceStatusEnum('status').default('absent').notNull(),
    note: text('note'),
    recordedBy: uuid('recorded_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    locationId: uuid('location_id'),
    checkedInLatitude: doublePrecision('checked_in_latitude'),
    checkedInLongitude: doublePrecision('checked_in_longitude'),
    locationNameSnapshot: text('location_name_snapshot'),
    locationLatitudeSnapshot: doublePrecision('location_latitude_snapshot'),
    locationLongitudeSnapshot: doublePrecision('location_longitude_snapshot'),
    radiusMetersSnapshot: doublePrecision('radius_meters_snapshot'),
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
    foreignKey({
      columns: [table.companyMemberId, table.companyId],
      foreignColumns: [companyMember.id, companyMember.companyId],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.scheduleSlotId, table.companyId],
      foreignColumns: [scheduleSlots.id, scheduleSlots.companyId],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.scheduleSlotId, table.locationId, table.companyId],
      foreignColumns: [
        scheduleSlotLocation.scheduleSlotId,
        scheduleSlotLocation.locationId,
        scheduleSlotLocation.companyId,
      ],
    }).onDelete('restrict'),
    check(
      'attendance_log_latitude_check',
      sql`checked_in_latitude BETWEEN -90 AND 90`,
    ),
    check(
      'attendance_log_longitude_check',
      sql`checked_in_longitude BETWEEN -180 AND 180`,
    ),
    check(
      'attendance_log_loc_latitude_check',
      sql`location_latitude_snapshot BETWEEN -90 AND 90`,
    ),
    check(
      'attendance_log_loc_longitude_check',
      sql`location_longitude_snapshot BETWEEN -180 AND 180`,
    ),
    check(
      'attendance_log_radius_meters_check',
      sql`radius_meters_snapshot > 0 AND radius_meters_snapshot < 'Infinity'::float8`,
    ),
    check(
      'attendance_location_snapshot_complete_check',
      sql`num_nonnulls(location_id, checked_in_latitude, checked_in_longitude, location_name_snapshot, location_latitude_snapshot, location_longitude_snapshot, radius_meters_snapshot) IN (0, 7)`,
    ),
    check(
      'attendance_location_event_check',
      sql`location_id IS NULL OR (checked_in_at IS NOT NULL AND status IN ('present', 'late'))`,
    ),
  ],
);


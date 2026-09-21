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
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  deletedAtTimestamp,
  encryptedNumber,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { organization, organizationMember } from './organization';
import { role } from './permission';
import { user } from './user';
import { locations } from './location';

/**
 * Enums
 */

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'excused',
]);

/**
 * 1. Check-In Schedules Table
 */

export const checkInSchedules = pgTable(
  'check_in_schedules',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    unique('check_in_schedule_id_organization_unique').on(
      table.id,
      table.organizationId,
    ),
    index('check_in_schedule_organization_id_idx').on(table.organizationId),
    index('check_in_schedule_deleted_at_idx').on(table.deletedAt),
  ],
);

export const checkInScheduleRoles = pgTable(
  'check_in_schedule_roles',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id').notNull(),
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
    index('check_in_schedule_role_organization_role_idx').on(
      table.organizationId,
      table.roleId,
    ),
    foreignKey({
      columns: [table.checkInScheduleId, table.organizationId],
      foreignColumns: [checkInSchedules.id, checkInSchedules.organizationId],
    }).onDelete('cascade'),
  ],
);

/**
 * 2. Schedule Slots Table
 */

export const scheduleSlots = pgTable(
  'schedule_slots',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id').notNull(),
    checkInScheduleId: uuid('check_in_schedule_id').notNull(),
    slotOrder: integer('slot_order').notNull(),
    label: text('label').notNull(),
    windowStart: time('window_start').notNull(),
    windowEnd: time('window_end').notNull(),
    isRequired: boolean('is_required').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('schedule_slot_schedule_id_idx').on(table.checkInScheduleId),
    index('schedule_slot_deleted_at_idx').on(table.deletedAt),
    unique('schedule_slots_id_organization_unique').on(
      table.id,
      table.organizationId,
    ),
    unique('schedule_slot_order_unique').on(
      table.checkInScheduleId,
      table.slotOrder,
    ),
    foreignKey({
      columns: [table.checkInScheduleId, table.organizationId],
      foreignColumns: [checkInSchedules.id, checkInSchedules.organizationId],
    }).onDelete('cascade'),
  ],
);

/**
 * 3. Schedule Slot Location Table
 */

export const scheduleSlotLocation = pgTable(
  'schedule_slot_location',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id').notNull(),
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
    unique('schedule_slot_location_slot_loc_organization_unique').on(
      table.scheduleSlotId,
      table.locationId,
      table.organizationId,
    ),
    index('schedule_slot_location_loc_organization_idx').on(
      table.locationId,
      table.organizationId,
    ),
    index('schedule_slot_location_organization_slot_active_idx').on(
      table.organizationId,
      table.scheduleSlotId,
      table.isActive,
    ),
    foreignKey({
      columns: [table.scheduleSlotId, table.organizationId],
      foreignColumns: [scheduleSlots.id, scheduleSlots.organizationId],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.locationId, table.organizationId],
      foreignColumns: [locations.id, locations.organizationId],
    }).onDelete('restrict'),
  ],
);

/**
 * 4. Attendance Logs Table
 */

export const attendanceLogs = pgTable(
  'attendance_logs',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id').notNull(),
    organizationMemberId: uuid('organization_member_id').notNull(),
    scheduleSlotId: uuid('schedule_slot_id').notNull(),
    workDate: date('work_date').notNull(),
    checkedInAt: timestamp('checked_in_at'),
    status: attendanceStatusEnum('status').default('absent').notNull(),
    note: text('note'),
    recordedBy: uuid('recorded_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    locationId: uuid('location_id'),
    checkedInLatitude: encryptedNumber('checked_in_latitude'),
    checkedInLongitude: encryptedNumber('checked_in_longitude'),
    locationNameSnapshot: text('location_name_snapshot'),
    locationLatitudeSnapshot: encryptedNumber('location_latitude_snapshot'),
    locationLongitudeSnapshot: encryptedNumber('location_longitude_snapshot'),
    radiusMetersSnapshot: doublePrecision('radius_meters_snapshot'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('attendance_log_member_id_idx').on(table.organizationMemberId),
    index('attendance_log_slot_id_idx').on(table.scheduleSlotId),
    index('attendance_log_work_date_idx').on(table.workDate),
    index('attendance_log_deleted_at_idx').on(table.deletedAt),
    uniqueIndex('attendance_log_unique_per_slot_per_day')
      .on(table.organizationMemberId, table.scheduleSlotId, table.workDate)
      .where(sql`${table.deletedAt} IS NULL`),
    foreignKey({
      columns: [table.organizationMemberId, table.organizationId],
      foreignColumns: [
        organizationMember.id,
        organizationMember.organizationId,
      ],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.scheduleSlotId, table.organizationId],
      foreignColumns: [scheduleSlots.id, scheduleSlots.organizationId],
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.scheduleSlotId, table.locationId, table.organizationId],
      foreignColumns: [
        scheduleSlotLocation.scheduleSlotId,
        scheduleSlotLocation.locationId,
        scheduleSlotLocation.organizationId,
      ],
    }).onDelete('restrict'),
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

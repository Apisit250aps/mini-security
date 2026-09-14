import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
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
import { user } from './user';

// ==========================================
// Enums
// ==========================================

export const leaveRequestStatusEnum = pgEnum('leave_request_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const leaveUnitEnum = pgEnum('leave_unit', ['day', 'half_day', 'hour']);

// ==========================================
// 1. Leave Types Table
// ==========================================

export const leaveTypes = pgTable(
  'leave_types',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    unit: leaveUnitEnum('unit').default('day').notNull(),
    requiresProof: boolean('requires_proof').default(false).notNull(),
    maxDaysPerYear: integer('max_days_per_year'),
    isPaid: boolean('is_paid').default(true).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('leave_type_company_id_idx').on(table.companyId),
    unique('leave_type_company_name_unique').on(table.companyId, table.name),
  ],
);

// ==========================================
// 2. Leave Quotas Table
// ==========================================

export const leaveQuotas = pgTable(
  'leave_quotas',
  {
    id: primaryKeyUuid7('id'),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    leaveTypeId: uuid('leave_type_id')
      .notNull()
      .references(() => leaveTypes.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    totalDays: numeric('total_days', { precision: 5, scale: 2 }).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('leave_quota_member_id_idx').on(table.companyMemberId),
    index('leave_quota_type_id_idx').on(table.leaveTypeId),
    unique('leave_quota_member_type_year_unique').on(
      table.companyMemberId,
      table.leaveTypeId,
      table.year,
    ),
    check('leave_quota_total_days_check', sql`total_days >= 0`),
  ],
);

// ==========================================
// 3. Leave Requests Table
// ==========================================

export const leaveRequests = pgTable(
  'leave_requests',
  {
    id: primaryKeyUuid7('id'),
    companyMemberId: uuid('company_member_id')
      .notNull()
      .references(() => companyMember.id, { onDelete: 'cascade' }),
    leaveTypeId: uuid('leave_type_id')
      .notNull()
      .references(() => leaveTypes.id, { onDelete: 'restrict' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    startTime: time('start_time'),
    endTime: time('end_time'),
    minutesPerDaySnapshot: integer('minutes_per_day_snapshot'),
    unit: leaveUnitEnum('unit').default('day').notNull(),
    reason: text('reason').notNull(),
    proofUrl: text('proof_url'),
    status: leaveRequestStatusEnum('status').default('pending').notNull(),
    reviewedBy: uuid('reviewed_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    reviewedAt: timestamp('reviewed_at'),
    reviewNote: text('review_note'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('leave_request_member_id_idx').on(table.companyMemberId),
    index('leave_request_type_id_idx').on(table.leaveTypeId),
    index('leave_request_status_idx').on(table.status),
    index('leave_request_member_date_idx').on(
      table.companyMemberId,
      table.startDate,
      table.endDate,
    ),
    check('leave_request_date_order_check', sql`end_date >= start_date`),
    check(
      'leave_request_source_interval_check',
      sql`((unit IN ('day', 'half_day') AND start_time IS NULL AND end_time IS NULL AND minutes_per_day_snapshot IS NULL) OR (unit = 'hour' AND start_date = end_date AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time AND minutes_per_day_snapshot IS NOT NULL AND minutes_per_day_snapshot > 0))`,
    ),
  ],
);

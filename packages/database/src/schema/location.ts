import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  doublePrecision,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { primaryKeyUuid7 } from '#lib/utils';
import { company, companyBranch } from './company';

export const locations = pgTable(
  'locations',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'restrict' }),
    companyBranchId: uuid('company_branch_id').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    radiusMeters: doublePrecision('radius_meters').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('locations_id_company_id_unique').on(table.id, table.companyId),
    index('locations_branch_company_idx').on(
      table.companyBranchId,
      table.companyId,
    ),
    index('locations_company_active_idx').on(table.companyId, table.isActive),
    uniqueIndex('locations_one_primary_per_branch')
      .on(table.companyBranchId)
      .where(sql`is_primary = true`),
    foreignKey({
      columns: [table.companyBranchId, table.companyId],
      foreignColumns: [companyBranch.id, companyBranch.companyId],
    }).onDelete('restrict'),
    check('location_latitude_check', sql`latitude BETWEEN -90 AND 90`),
    check('location_longitude_check', sql`longitude BETWEEN -180 AND 180`),
    check(
      'location_radius_meters_check',
      sql`radius_meters > 0 AND radius_meters < 'Infinity'::float8`,
    ),
    check('location_primary_active_check', sql`NOT is_primary OR is_active`),
  ],
);

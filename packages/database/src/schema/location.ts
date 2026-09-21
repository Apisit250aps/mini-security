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
import {
  deletedAtTimestamp,
  encryptedNumber,
  encryptedText,
  primaryKeyUuid7,
} from '#lib/utils';
import { organization, site } from './organization';

export const locations = pgTable(
  'locations',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'restrict' }),
    siteId: uuid('site_id').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    name: text('name').notNull(),
    address: encryptedText('address').notNull(),
    latitude: encryptedNumber('latitude').notNull(),
    longitude: encryptedNumber('longitude').notNull(),
    radiusMeters: doublePrecision('radius_meters').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    unique('locations_id_organization_id_unique').on(
      table.id,
      table.organizationId,
    ),
    index('locations_site_organization_idx').on(
      table.siteId,
      table.organizationId,
    ),
    index('locations_organization_active_idx').on(
      table.organizationId,
      table.isActive,
    ),
    index('locations_deleted_at_idx').on(table.deletedAt),
    uniqueIndex('locations_one_primary_per_site')
      .on(table.siteId)
      .where(sql`is_primary = true`),
    foreignKey({
      columns: [table.siteId, table.organizationId],
      foreignColumns: [site.id, site.organizationId],
    }).onDelete('restrict'),
    check(
      'location_radius_meters_check',
      sql`radius_meters > 0 AND radius_meters < 'Infinity'::float8`,
    ),
    check('location_primary_active_check', sql`NOT is_primary OR is_active`),
  ],
);

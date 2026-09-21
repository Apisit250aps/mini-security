import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  deletedAtTimestamp,
  encryptedText,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { user } from './user';

export const organization = pgTable(
  'organization',
  {
    id: primaryKeyUuid7('id'),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logo: text('logo'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('organization_slug_unique')
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index('organization_slug_idx').on(table.slug),
    index('organization_deleted_at_idx').on(table.deletedAt),
  ],
);

export const site = pgTable(
  'site',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    address: encryptedText('address'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('site_organization_id_idx').on(table.organizationId),
    index('site_deleted_at_idx').on(table.deletedAt),
    unique('site_id_organization_id_unique').on(table.id, table.organizationId),
  ],
);

export const organizationMember = pgTable(
  'organization_member',
  {
    id: primaryKeyUuid7('id'),
    siteId: uuid('site_id')
      .notNull()
      .references(() => site.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('organization_member_site_id_idx').on(table.siteId),
    index('organization_member_organization_id_idx').on(table.organizationId),
    index('organization_member_user_id_idx').on(table.userId),
    index('organization_member_role_id_idx').on(table.roleId),
    index('organization_member_organization_user_idx').on(
      table.organizationId,
      table.userId,
    ),
    index('organization_member_deleted_at_idx').on(table.deletedAt),
    unique('organization_member_id_organization_unique').on(
      table.id,
      table.organizationId,
    ),
  ],
);

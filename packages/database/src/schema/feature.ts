import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  deletedAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { organization } from './organization';
import { role } from './role';
import { user } from './user';

export const feature = pgTable(
  'feature',
  {
    id: primaryKeyUuid7('id'),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('feature_code_idx').on(table.code),
    index('feature_category_idx').on(table.category),
    index('feature_is_active_idx').on(table.isActive),
    index('feature_deleted_at_idx').on(table.deletedAt),
  ],
);

export const organizationFeature = pgTable(
  'organization_feature',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => feature.id, { onDelete: 'cascade' }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    assignedBy: uuid('assigned_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    expiresAt: timestamp('expires_at'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('organization_feature_organization_id_idx').on(table.organizationId),
    index('organization_feature_feature_id_idx').on(table.featureId),
    index('organization_feature_is_enabled_idx').on(table.isEnabled),
    index('organization_feature_deleted_at_idx').on(table.deletedAt),
    unique('organization_feature_organization_feature_unique').on(
      table.organizationId,
      table.featureId,
    ),
  ],
);

export const roleFeature = pgTable(
  'role_feature',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => feature.id, { onDelete: 'cascade' }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('role_feature_organization_id_idx').on(table.organizationId),
    index('role_feature_role_id_idx').on(table.roleId),
    index('role_feature_feature_id_idx').on(table.featureId),
    index('role_feature_deleted_at_idx').on(table.deletedAt),
    unique('role_feature_role_feature_unique').on(
      table.roleId,
      table.featureId,
    ),
  ],
);

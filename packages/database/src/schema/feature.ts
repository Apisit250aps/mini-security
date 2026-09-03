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
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { company } from './company';
import { role } from './permission';
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
  },
  (table) => [
    index('feature_code_idx').on(table.code),
    index('feature_category_idx').on(table.category),
    index('feature_is_active_idx').on(table.isActive),
  ],
);

export const companyFeature = pgTable(
  'company_feature',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
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
  },
  (table) => [
    index('company_feature_company_id_idx').on(table.companyId),
    index('company_feature_feature_id_idx').on(table.featureId),
    index('company_feature_is_enabled_idx').on(table.isEnabled),
    unique('company_feature_company_feature_unique').on(
      table.companyId,
      table.featureId,
    ),
  ],
);

export const roleFeature = pgTable(
  'role_feature',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    featureId: uuid('feature_id')
      .notNull()
      .references(() => feature.id, { onDelete: 'cascade' }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('role_feature_company_id_idx').on(table.companyId),
    index('role_feature_role_id_idx').on(table.roleId),
    index('role_feature_feature_id_idx').on(table.featureId),
    unique('role_feature_role_feature_unique').on(
      table.roleId,
      table.featureId,
    ),
  ],
);

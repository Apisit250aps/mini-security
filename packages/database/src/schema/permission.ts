import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { company } from './company';

export const role = pgTable(
  'role',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id').references(() => company.id, {
      onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    description: text('description'),
    isSystemDefault: boolean('is_system_default').default(false).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('role_company_id_idx').on(table.companyId),
    index('role_is_system_default_idx').on(table.isSystemDefault),
  ],
);

export const permission = pgTable(
  'permission',
  {
    id: primaryKeyUuid7('id'),
    action: text('action').notNull().unique(),
    module: text('module').notNull(),
    description: text('description'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('permission_action_idx').on(table.action),
    index('permission_module_idx').on(table.module),
  ],
);

export const rolePermission = pgTable(
  'role_permission',
  {
    id: primaryKeyUuid7('id'),
    roleId: uuid('role_id')
      .notNull()
      .references(() => role.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permission.id, { onDelete: 'cascade' }),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('role_permission_role_id_idx').on(table.roleId),
    index('role_permission_permission_id_idx').on(table.permissionId),
    index('role_permission_unique_idx').on(table.roleId, table.permissionId),
  ],
);

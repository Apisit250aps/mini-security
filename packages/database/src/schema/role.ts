import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  deletedAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { organization } from './organization';

export const roleTypeEnum = pgEnum('role_type', [
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'MEMBER',
  'VIEWER',
]);

export const role = pgTable(
  'role',
  {
    id: primaryKeyUuid7('id'),
    organizationId: uuid('organization_id').references(() => organization.id, {
      onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    description: text('description'),
    roleType: roleTypeEnum('role_type').default('MEMBER').notNull(),
    isSystemDefault: boolean('is_system_default').default(false).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('role_organization_id_idx').on(table.organizationId),
    index('role_is_system_default_idx').on(table.isSystemDefault),
    index('role_role_type_idx').on(table.roleType),
    index('role_deleted_at_idx').on(table.deletedAt),
    uniqueIndex('role_system_default_unique')
      .on(table.roleType)
      .where(sql`organization_id IS NULL AND is_system_default = true`),
  ],
);

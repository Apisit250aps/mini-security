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

export const company = pgTable(
  'company',
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
    uniqueIndex('company_slug_unique')
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index('company_slug_idx').on(table.slug),
    index('company_deleted_at_idx').on(table.deletedAt),
  ],
);

export const companyBranch = pgTable(
  'company_branch',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    address: encryptedText('address'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    index('company_branch_company_id_idx').on(table.companyId),
    index('company_branch_deleted_at_idx').on(table.deletedAt),
    unique('company_branch_id_company_id_unique').on(table.id, table.companyId),
  ],
);

export const companyMember = pgTable(
  'company_member',
  {
    id: primaryKeyUuid7('id'),
    companyBranchId: uuid('company_branch_id')
      .notNull()
      .references(() => companyBranch.id, { onDelete: 'cascade' }),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
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
    index('company_member_company_branch_id_idx').on(table.companyBranchId),
    index('company_member_company_id_idx').on(table.companyId),
    index('company_member_user_id_idx').on(table.userId),
    index('company_member_role_id_idx').on(table.roleId),
    index('company_member_company_user_idx').on(table.companyId, table.userId),
    index('company_member_deleted_at_idx').on(table.deletedAt),
    unique('company_member_id_company_unique').on(table.id, table.companyId),
  ],
);

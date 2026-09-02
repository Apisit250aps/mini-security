import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { user } from './user';

export const company = pgTable(
  'company',
  {
    id: primaryKeyUuid7('id'),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    logo: text('logo'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('company_slug_idx').on(table.slug)],
);

export const companyBranch = pgTable(
  'company_branch',
  {
    id: primaryKeyUuid7('id'),
    companyId: uuid('company_id')
      .notNull()
      .references(() => company.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    address: text('address'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('company_branch_company_id_idx').on(table.companyId)],
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
  },
  (table) => [
    index('company_member_company_branch_id_idx').on(table.companyBranchId),
    index('company_member_company_id_idx').on(table.companyId),
    index('company_member_user_id_idx').on(table.userId),
    index('company_member_role_id_idx').on(table.roleId),
    index('company_member_company_user_idx').on(table.companyId, table.userId),
  ],
);

import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  deletedAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';

export const user = pgTable(
  'user',
  {
    id: primaryKeyUuid7('id'),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    isAdmin: boolean('is_admin').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
    deletedAt: deletedAtTimestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('users_email_unique')
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
    index('user_email_idx').on(table.email),
    index('user_is_admin_idx').on(table.isAdmin),
    index('user_deleted_at_idx').on(table.deletedAt),
  ],
);

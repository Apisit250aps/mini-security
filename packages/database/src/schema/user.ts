import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';

export const user = pgTable(
  'user',
  {
    id: primaryKeyUuid7('id'),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    isAdmin: boolean('is_admin').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('user_email_idx').on(table.email),
    index('user_is_admin_idx').on(table.isAdmin),
  ],
);

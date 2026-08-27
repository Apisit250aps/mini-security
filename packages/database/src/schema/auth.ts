import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
  createdAtTimestamp,
  primaryKeyUuid7,
  updatedAtTimestamp,
} from '#lib/utils';
import { user } from './user';

export const session = pgTable(
  'session',
  {
    id: primaryKeyUuid7('id'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    activeCompanyId: uuid('active_company_id'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('session_token_idx').on(table.token),
    index('session_user_id_idx').on(table.userId),
  ],
);

export const account = pgTable(
  'account',
  {
    id: primaryKeyUuid7('id'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    index('account_provider_account_idx').on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable(
  'verification',
  {
    id: primaryKeyUuid7('id'),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: createdAtTimestamp('created_at'),
    updatedAt: updatedAtTimestamp('updated_at'),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

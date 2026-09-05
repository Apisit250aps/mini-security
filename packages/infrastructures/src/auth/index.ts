import { eq } from 'drizzle-orm';
import { hash, verify } from '#lib/password';
import { config } from '@repo/configs';
import db from '@repo/database/db';
import * as schema from '@repo/database/schema';
import { uuid } from '@repo/domains';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins/bearer';
import { jwt } from 'better-auth/plugins/jwt';
import { getUserPermissionActions } from './helpers';

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      jwks: schema.jwks,
    },
  }),
  plugins: [jwt(), bearer()],
  advanced: {
    database: {
      generateId: () => uuid(),
    },
  },
  trustedOrigins: config.backend.corsOrigins.split(','),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash,
      verify,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const { actions, companyId } = await getUserPermissionActions(
            session.userId,
          );

          return {
            data: {
              ...session,
              activeCompanyId: companyId,
              permissions: actions.join(','),
            },
          };
        },
        after: async (session) => {
          if (session.userId) {
            await db
              .update(schema.user)
              .set({ lastLogin: new Date() })
              .where(eq(schema.user.id, session.userId));
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
      lastLogin: {
        type: 'date',
        required: false,
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      activeCompanyId: {
        type: 'string',
        required: false,
        input: false,
      },
      permissions: {
        type: 'string',
        required: false,
        input: false,
      },
    },

    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 5,
    freshAge: 60 * 5,
    deferSessionRefresh: true,

    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: 'compact',
    },
  },
});

export default auth;

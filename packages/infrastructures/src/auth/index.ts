import { hash, verify } from '#lib/password';
import { config } from '@repo/configs';
import db from '@repo/database/db';
import * as schema from '@repo/database/schema';
import { uuid } from '@repo/domains';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins/bearer';
import { jwt } from 'better-auth/plugins/jwt';

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
    password: {
      hash,
      verify,
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
    },
  },
});
export default auth;

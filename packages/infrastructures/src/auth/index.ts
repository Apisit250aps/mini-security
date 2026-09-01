import { and, eq } from 'drizzle-orm';
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
          let activeCompanyId = session.activeCompanyId as
            | string
            | null
            | undefined;
          if (!activeCompanyId && session.userId) {
            // 1. Resolve first active company membership for user
            const [member] = await db
              .select({ companyId: schema.companyMember.companyId })
              .from(schema.companyMember)
              .where(
                and(
                  eq(schema.companyMember.userId, session.userId),
                  eq(schema.companyMember.isActive, true),
                ),
              )
              .limit(1);

            if (member?.companyId) {
              activeCompanyId = member.companyId;
            } else {
              // 2. Fallback for super admin: pick first active company
              const [userRecord] = await db
                .select({ isAdmin: schema.user.isAdmin })
                .from(schema.user)
                .where(eq(schema.user.id, session.userId))
                .limit(1);

              if (userRecord?.isAdmin) {
                const [firstCompany] = await db
                  .select({ id: schema.company.id })
                  .from(schema.company)
                  .where(eq(schema.company.isActive, true))
                  .limit(1);
                if (firstCompany?.id) {
                  activeCompanyId = firstCompany.id;
                }
              }
            }
          }

          return {
            data: {
              ...session,
              activeCompanyId: activeCompanyId ?? null,
            },
          };
        },
        after: async (session) => {
          // Update user's lastLogin timestamp upon session creation (login/sign-in)
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
    },
  },
});
export default auth;

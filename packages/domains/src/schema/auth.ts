import { z } from 'zod';
import { BaseEntity, DateField, StringField, UUIDField } from '#lib/entity';

// --- Session Schema ---
export const sessionSchema = BaseEntity({
  userId: UUIDField({ required: true }),
  token: StringField({ required: true }),
  expiresAt: DateField({ required: true }),
  ipAddress: StringField({ required: false, nullable: true }),
  userAgent: StringField({ required: false, nullable: true }),
  activeCompanyId: UUIDField({ required: false, nullable: true }),
});

export const createSessionSchema = sessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSessionSchema = sessionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type SessionEntity = z.infer<typeof sessionSchema>;
export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;

// --- Account Schema (Credentials & OAuth Providers like Google) ---
export const accountSchema = BaseEntity({
  userId: UUIDField({ required: true }),
  accountId: StringField({ required: true }),
  providerId: StringField({ required: true }),
  accessToken: StringField({ required: false, nullable: true }),
  refreshToken: StringField({ required: false, nullable: true }),
  idToken: StringField({ required: false, nullable: true }),
  accessTokenExpiresAt: DateField({ required: false, nullable: true }),
  refreshTokenExpiresAt: DateField({ required: false, nullable: true }),
  scope: StringField({ required: false, nullable: true }),
  password: StringField({ required: false, nullable: true }),
});

export const createAccountSchema = accountSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAccountSchema = accountSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type AccountEntity = z.infer<typeof accountSchema>;
export type CreateAccount = z.infer<typeof createAccountSchema>;
export type UpdateAccount = z.infer<typeof updateAccountSchema>;

// --- Verification Schema ---
export const verificationSchema = BaseEntity({
  identifier: StringField({ required: true }),
  value: StringField({ required: true }),
  expiresAt: DateField({ required: true }),
});

export const createVerificationSchema = verificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVerificationSchema = verificationSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type VerificationEntity = z.infer<typeof verificationSchema>;
export type CreateVerification = z.infer<typeof createVerificationSchema>;
export type UpdateVerification = z.infer<typeof updateVerificationSchema>;

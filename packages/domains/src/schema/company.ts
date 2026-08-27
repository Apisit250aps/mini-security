import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  StringField,
  UUIDField,
} from '#lib/entity';

// --- Company Schema ---
export const companySchema = BaseEntity({
  name: StringField({ required: true }),
  slug: StringField({ required: true }),
  logo: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCompanySchema = companySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCompanySchema = companySchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CompanyEntity = z.infer<typeof companySchema>;
export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

// --- Company Member Schema ---
export const companyMemberSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  userId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCompanyMemberSchema = companyMemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCompanyMemberSchema = companyMemberSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CompanyMemberEntity = z.infer<typeof companyMemberSchema>;
export type CreateCompanyMember = z.infer<typeof createCompanyMemberSchema>;
export type UpdateCompanyMember = z.infer<typeof updateCompanyMemberSchema>;

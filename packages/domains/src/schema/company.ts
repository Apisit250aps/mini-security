import { z } from 'zod';
import { BaseEntity, BooleanField, StringField, UUIDField } from '#lib/entity';

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

// --- Company Branch Schema ---
export const companyBranchSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  address: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCompanyBranchSchema = companyBranchSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCompanyBranchSchema = companyBranchSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CompanyBranchEntity = z.infer<typeof companyBranchSchema>;
export type CreateCompanyBranch = z.infer<typeof createCompanyBranchSchema>;
export type UpdateCompanyBranch = z.infer<typeof updateCompanyBranchSchema>;

// --- Company Member Schema ---
export const companyMemberSchema = BaseEntity({
  companyBranchId: UUIDField({ required: true }),
  companyId: UUIDField({ required: true }),
  userId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createCompanyMemberSchema = companyMemberSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    companyBranchId: UUIDField({ required: false, nullable: true }),
  });

export const updateCompanyMemberSchema = companyMemberSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CompanyMemberEntity = z.infer<typeof companyMemberSchema>;
export type CreateCompanyMember = z.infer<typeof createCompanyMemberSchema>;
export type UpdateCompanyMember = z.infer<typeof updateCompanyMemberSchema>;

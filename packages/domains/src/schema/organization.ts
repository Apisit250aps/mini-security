import { z } from 'zod';
import { BaseEntity, BooleanField, StringField, UUIDField } from '#lib/entity';

// --- Organization Schema ---
export const organizationSchema = BaseEntity({
  name: StringField({ required: true }),
  slug: StringField({ required: true }),
  logo: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrganizationSchema = organizationSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type OrganizationEntity = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;

// --- Site Schema ---
export const siteSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  name: StringField({ required: true }),
  address: StringField({ required: false, nullable: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createSiteSchema = siteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSiteSchema = siteSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type SiteEntity = z.infer<typeof siteSchema>;
export type CreateSite = z.infer<typeof createSiteSchema>;
export type UpdateSite = z.infer<typeof updateSiteSchema>;

// --- Organization Member Schema ---
export const organizationMemberSchema = BaseEntity({
  siteId: UUIDField({ required: true }),
  organizationId: UUIDField({ required: true }),
  userId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createOrganizationMemberSchema = organizationMemberSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    siteId: UUIDField({ required: false, nullable: true }),
  });

export const updateOrganizationMemberSchema = organizationMemberSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type OrganizationMemberEntity = z.infer<typeof organizationMemberSchema>;
export type CreateOrganizationMember = z.infer<
  typeof createOrganizationMemberSchema
>;
export type UpdateOrganizationMember = z.infer<
  typeof updateOrganizationMemberSchema
>;

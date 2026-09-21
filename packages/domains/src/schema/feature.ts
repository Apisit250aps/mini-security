import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  DateField,
  StringField,
  UUIDField,
} from '#lib/entity';

/**
 * 1. Feature Schema (Master Catalog)
 */

export const featureSchema = BaseEntity({
  code: StringField({ required: true }),
  name: StringField({ required: true }),
  description: StringField({ required: false, nullable: true }),
  category: StringField({ required: true }),
  isActive: BooleanField({ default: () => true }),
});

export const createFeatureSchema = featureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFeatureSchema = featureSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FeatureEntity = z.infer<typeof featureSchema>;
export type CreateFeature = z.infer<typeof createFeatureSchema>;
export type UpdateFeature = z.infer<typeof updateFeatureSchema>;

/**
 * 2. Organization Feature Schema (Entitlement & Toggle)
 */

export const organizationFeatureSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  featureId: UUIDField({ required: true }),
  isEnabled: BooleanField({ default: () => true }),
  assignedBy: UUIDField({ required: false, nullable: true }),
  expiresAt: DateField({ required: false, nullable: true }),
});

export const createOrganizationFeatureSchema = organizationFeatureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrganizationFeatureSchema = organizationFeatureSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type OrganizationFeatureEntity = z.infer<
  typeof organizationFeatureSchema
>;
export type CreateOrganizationFeature = z.infer<
  typeof createOrganizationFeatureSchema
>;
export type UpdateOrganizationFeature = z.infer<
  typeof updateOrganizationFeatureSchema
>;

/**
 * 3. Role Feature Schema (Delegation)
 */

export const roleFeatureSchema = BaseEntity({
  organizationId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  featureId: UUIDField({ required: true }),
  isEnabled: BooleanField({ default: () => true }),
});

export const createRoleFeatureSchema = roleFeatureSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleFeatureSchema = roleFeatureSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type RoleFeatureEntity = z.infer<typeof roleFeatureSchema>;
export type CreateRoleFeature = z.infer<typeof createRoleFeatureSchema>;
export type UpdateRoleFeature = z.infer<typeof updateRoleFeatureSchema>;

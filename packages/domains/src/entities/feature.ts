import type {
  FeatureEntity,
  OrganizationFeatureEntity,
  RoleFeatureEntity,
} from '#schema/feature';

export class Feature implements FeatureEntity {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: FeatureEntity) {
    this.id = data.id;
    this.code = data.code;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class OrganizationFeature implements OrganizationFeatureEntity {
  id: string;
  organizationId: string;
  featureId: string;
  isEnabled: boolean;
  assignedBy?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: OrganizationFeatureEntity) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.featureId = data.featureId;
    this.isEnabled = data.isEnabled;
    this.assignedBy = data.assignedBy;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class RoleFeature implements RoleFeatureEntity {
  id: string;
  organizationId: string;
  roleId: string;
  featureId: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RoleFeatureEntity) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.roleId = data.roleId;
    this.featureId = data.featureId;
    this.isEnabled = data.isEnabled;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

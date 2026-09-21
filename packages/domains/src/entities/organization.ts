import type {
  OrganizationEntity,
  OrganizationMemberEntity,
  SiteEntity,
} from '#schema/organization';

export class Organization implements OrganizationEntity {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: OrganizationEntity) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.logo = data.logo;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Site implements SiteEntity {
  id: string;
  organizationId: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: SiteEntity) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.name = data.name;
    this.address = data.address;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class OrganizationMember implements OrganizationMemberEntity {
  id: string;
  siteId: string;
  organizationId: string;
  userId: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: OrganizationMemberEntity) {
    this.id = data.id;
    this.siteId = data.siteId;
    this.organizationId = data.organizationId;
    this.userId = data.userId;
    this.roleId = data.roleId;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

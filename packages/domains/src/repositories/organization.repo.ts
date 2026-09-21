import type { BaseRepository } from '../index';
import type {
  Organization,
  Site,
  OrganizationMember,
} from '#entities/organization';
import type {
  CreateOrganization,
  CreateSite,
  CreateOrganizationMember,
  UpdateOrganization,
  UpdateSite,
  UpdateOrganizationMember,
} from '#schema/organization';

export interface IOrganizationRepository
  extends BaseRepository<Organization, CreateOrganization, UpdateOrganization> {
  findBySlug(slug: string): Promise<Organization | null>;
  findActiveOrganizations(): Promise<Organization[]>;
}

export interface ISiteRepository
  extends BaseRepository<Site, CreateSite, UpdateSite> {
  findByOrganizationId(organizationId: string): Promise<Site[]>;
  findDefaultByOrganizationId(organizationId: string): Promise<Site | null>;
  findByName(organizationId: string, name: string): Promise<Site | null>;
}

export interface IOrganizationMemberRepository
  extends BaseRepository<
    OrganizationMember,
    CreateOrganizationMember,
    UpdateOrganizationMember
  > {
  findByOrganizationId(organizationId: string): Promise<OrganizationMember[]>;
  findByUserId(userId: string): Promise<OrganizationMember[]>;
  findBySiteId(siteId: string): Promise<OrganizationMember[]>;
  findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | null>;
  deleteByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<void>;
}

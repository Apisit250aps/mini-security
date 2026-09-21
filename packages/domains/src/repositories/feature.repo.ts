import type { BaseRepository } from '../index';
import type {
  OrganizationFeature,
  Feature,
  RoleFeature,
} from '#entities/feature';
import type {
  CreateOrganizationFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateOrganizationFeature,
  UpdateFeature,
  UpdateRoleFeature,
} from '#schema/feature';

export interface IFeatureRepository
  extends BaseRepository<Feature, CreateFeature, UpdateFeature> {
  findByCode(code: string): Promise<Feature | null>;
  findByCategory(category: string): Promise<Feature[]>;
  findActiveFeatures(): Promise<Feature[]>;
}

export interface IOrganizationFeatureRepository
  extends BaseRepository<
    OrganizationFeature,
    CreateOrganizationFeature,
    UpdateOrganizationFeature
  > {
  findByOrganizationId(organizationId: string): Promise<OrganizationFeature[]>;
  findActiveByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationFeature[]>;
  findByOrganizationAndFeature(
    organizationId: string,
    featureId: string,
  ): Promise<OrganizationFeature | null>;
  findByOrganizationAndFeatureCode(
    organizationId: string,
    featureCode: string,
  ): Promise<OrganizationFeature | null>;
  findFeaturesByOrganizationId(
    organizationId: string,
    onlyEnabled?: boolean,
  ): Promise<Feature[]>;
  toggleFeature(
    organizationId: string,
    featureId: string,
    isEnabled: boolean,
  ): Promise<OrganizationFeature>;
  deleteByOrganizationAndFeature(
    organizationId: string,
    featureId: string,
  ): Promise<void>;
}

export interface IRoleFeatureRepository
  extends BaseRepository<RoleFeature, CreateRoleFeature, UpdateRoleFeature> {
  findByRoleId(roleId: string): Promise<RoleFeature[]>;
  findByOrganizationId(organizationId: string): Promise<RoleFeature[]>;
  findByRoleAndFeature(
    roleId: string,
    featureId: string,
  ): Promise<RoleFeature | null>;
  findFeaturesByRoleId(roleId: string): Promise<Feature[]>;
  deleteByRoleAndFeature(roleId: string, featureId: string): Promise<void>;
  deleteByRoleId(roleId: string): Promise<void>;
}

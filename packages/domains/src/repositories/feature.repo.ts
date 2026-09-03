import type { BaseRepository } from '../index';
import type { CompanyFeature, Feature, RoleFeature } from '#entities/feature';
import type {
  CreateCompanyFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateCompanyFeature,
  UpdateFeature,
  UpdateRoleFeature,
} from '#schema/feature';

export interface IFeatureRepository
  extends BaseRepository<Feature, CreateFeature, UpdateFeature> {
  findByCode(code: string): Promise<Feature | null>;
  findByCategory(category: string): Promise<Feature[]>;
  findActiveFeatures(): Promise<Feature[]>;
}

export interface ICompanyFeatureRepository
  extends BaseRepository<
    CompanyFeature,
    CreateCompanyFeature,
    UpdateCompanyFeature
  > {
  findByCompanyId(companyId: string): Promise<CompanyFeature[]>;
  findActiveByCompanyId(companyId: string): Promise<CompanyFeature[]>;
  findByCompanyAndFeature(
    companyId: string,
    featureId: string,
  ): Promise<CompanyFeature | null>;
  findByCompanyAndFeatureCode(
    companyId: string,
    featureCode: string,
  ): Promise<CompanyFeature | null>;
  findFeaturesByCompanyId(
    companyId: string,
    onlyEnabled?: boolean,
  ): Promise<Feature[]>;
  toggleFeature(
    companyId: string,
    featureId: string,
    isEnabled: boolean,
  ): Promise<CompanyFeature>;
  deleteByCompanyAndFeature(
    companyId: string,
    featureId: string,
  ): Promise<void>;
}

export interface IRoleFeatureRepository
  extends BaseRepository<RoleFeature, CreateRoleFeature, UpdateRoleFeature> {
  findByRoleId(roleId: string): Promise<RoleFeature[]>;
  findByCompanyId(companyId: string): Promise<RoleFeature[]>;
  findByRoleAndFeature(
    roleId: string,
    featureId: string,
  ): Promise<RoleFeature | null>;
  findFeaturesByRoleId(roleId: string): Promise<Feature[]>;
  deleteByRoleAndFeature(roleId: string, featureId: string): Promise<void>;
  deleteByRoleId(roleId: string): Promise<void>;
}

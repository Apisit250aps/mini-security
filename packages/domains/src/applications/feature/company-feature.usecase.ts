import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { CompanyFeature, Feature } from '#entities/feature';
import type { CreateCompanyFeature } from '#schema/feature';

// Context Types
export type IAssignCompanyFeatureContext = ISecurityContext & {
  data: CreateCompanyFeature;
};

export type IToggleCompanyFeatureContext = ISecurityContext & {
  companyId: string;
  featureId: string;
  isEnabled: boolean;
};

export type IRemoveCompanyFeatureContext = ISecurityContext & {
  companyId: string;
  featureId: string;
};

export type IGetCompanyFeaturesContext = ISecurityContext & {
  companyId: string;
  onlyEnabled?: boolean;
};

export type IGetCompanyAvailableFeaturesContext = ISecurityContext & {
  companyId: string;
};

// Use Case Contracts
export type IAssignCompanyFeatureUseCase = BaseUseCase<
  IAssignCompanyFeatureContext,
  CompanyFeature
>;

export type IToggleCompanyFeatureUseCase = BaseUseCase<
  IToggleCompanyFeatureContext,
  CompanyFeature
>;

export type IRemoveCompanyFeatureUseCase = BaseUseCase<
  IRemoveCompanyFeatureContext,
  void
>;

export type IGetCompanyFeaturesUseCase = BaseUseCase<
  IGetCompanyFeaturesContext,
  CompanyFeature[]
>;

export type IGetCompanyAvailableFeaturesUseCase = BaseUseCase<
  IGetCompanyAvailableFeaturesContext,
  Feature[]
>;

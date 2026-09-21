import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { OrganizationFeature, Feature } from '#entities/feature';
import type { CreateOrganizationFeature } from '#schema/feature';

// Context Types
export type IAssignOrganizationFeatureContext = ISecurityContext & {
  data: CreateOrganizationFeature;
};

export type IToggleOrganizationFeatureContext = ISecurityContext & {
  organizationId: string;
  featureId: string;
  isEnabled: boolean;
};

export type IRemoveOrganizationFeatureContext = ISecurityContext & {
  organizationId: string;
  featureId: string;
};

export type IGetOrganizationFeaturesContext = ISecurityContext & {
  organizationId: string;
  onlyEnabled?: boolean;
};

export type IGetOrganizationAvailableFeaturesContext = ISecurityContext & {
  organizationId: string;
};

// Use Case Contracts
export type IAssignOrganizationFeatureUseCase = BaseUseCase<
  IAssignOrganizationFeatureContext,
  OrganizationFeature
>;

export type IToggleOrganizationFeatureUseCase = BaseUseCase<
  IToggleOrganizationFeatureContext,
  OrganizationFeature
>;

export type IRemoveOrganizationFeatureUseCase = BaseUseCase<
  IRemoveOrganizationFeatureContext,
  void
>;

export type IGetOrganizationFeaturesUseCase = BaseUseCase<
  IGetOrganizationFeaturesContext,
  OrganizationFeature[]
>;

export type IGetOrganizationAvailableFeaturesUseCase = BaseUseCase<
  IGetOrganizationAvailableFeaturesContext,
  Feature[]
>;

import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Feature, RoleFeature } from '#entities/feature';
import type { CreateRoleFeature } from '#schema/feature';

// Context Types
export type IAssignRoleFeatureContext = ISecurityContext & {
  data: CreateRoleFeature;
};

export type IToggleRoleFeatureContext = ISecurityContext & {
  companyId: string;
  roleId: string;
  featureId: string;
  isEnabled: boolean;
};

export type IRevokeRoleFeatureContext = ISecurityContext & {
  companyId: string;
  roleId: string;
  featureId: string;
};

export type IGetRoleFeaturesContext = ISecurityContext & {
  roleId: string;
};

export type IGetCompanyRoleFeaturesContext = ISecurityContext & {
  companyId: string;
};

export type ICheckRoleFeatureAccessContext = {
  companyId: string;
  roleId: string;
  featureCode: string;
};

// Use Case Contracts
export type IAssignRoleFeatureUseCase = BaseUseCase<
  IAssignRoleFeatureContext,
  RoleFeature
>;

export type IToggleRoleFeatureUseCase = BaseUseCase<
  IToggleRoleFeatureContext,
  RoleFeature
>;

export type IRevokeRoleFeatureUseCase = BaseUseCase<
  IRevokeRoleFeatureContext,
  void
>;

export type IGetRoleFeaturesUseCase = BaseUseCase<
  IGetRoleFeaturesContext,
  Feature[]
>;

export type IGetCompanyRoleFeaturesUseCase = BaseUseCase<
  IGetCompanyRoleFeaturesContext,
  RoleFeature[]
>;

export type ICheckRoleFeatureAccessUseCase = BaseUseCase<
  ICheckRoleFeatureAccessContext,
  boolean
>;

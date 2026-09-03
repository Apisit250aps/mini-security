import {
  AssignRoleFeatureUseCase,
  CheckRoleFeatureAccessUseCase,
  GetCompanyRoleFeaturesUseCase,
  GetRoleFeaturesUseCase,
  RevokeRoleFeatureUseCase,
  ToggleRoleFeatureUseCase,
} from '@repo/applications';
import {
  companyFeatureRepository,
  featureRepository,
  roleFeatureRepository,
} from '../../repositories';

export const assignRoleFeatureUseCase = new AssignRoleFeatureUseCase(
  roleFeatureRepository,
  companyFeatureRepository,
  featureRepository,
);

export const toggleRoleFeatureUseCase = new ToggleRoleFeatureUseCase(
  roleFeatureRepository,
);

export const revokeRoleFeatureUseCase = new RevokeRoleFeatureUseCase(
  roleFeatureRepository,
);

export const getRoleFeaturesUseCase = new GetRoleFeaturesUseCase(
  roleFeatureRepository,
);

export const getCompanyRoleFeaturesUseCase = new GetCompanyRoleFeaturesUseCase(
  roleFeatureRepository,
);

export const checkRoleFeatureAccessUseCase = new CheckRoleFeatureAccessUseCase(
  companyFeatureRepository,
  roleFeatureRepository,
  featureRepository,
);

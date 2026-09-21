import {
  AssignRoleFeatureUseCase,
  CheckRoleFeatureAccessUseCase,
  GetOrganizationRoleFeaturesUseCase,
  GetRoleFeaturesUseCase,
  RevokeRoleFeatureUseCase,
  ToggleRoleFeatureUseCase,
} from '@repo/applications';
import {
  organizationFeatureRepository,
  featureRepository,
  roleFeatureRepository,
} from '../../repositories';

export const assignRoleFeatureUseCase = new AssignRoleFeatureUseCase(
  roleFeatureRepository,
  organizationFeatureRepository,
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

export const getOrganizationRoleFeaturesUseCase =
  new GetOrganizationRoleFeaturesUseCase(roleFeatureRepository);

export const checkRoleFeatureAccessUseCase = new CheckRoleFeatureAccessUseCase(
  organizationFeatureRepository,
  roleFeatureRepository,
  featureRepository,
);

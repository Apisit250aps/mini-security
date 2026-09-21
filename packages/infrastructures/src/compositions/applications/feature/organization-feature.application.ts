import {
  AssignOrganizationFeatureUseCase,
  GetOrganizationAvailableFeaturesUseCase,
  GetOrganizationFeaturesUseCase,
  RemoveOrganizationFeatureUseCase,
  ToggleOrganizationFeatureUseCase,
} from '@repo/applications';
import {
  organizationFeatureRepository,
  featureRepository,
} from '../../repositories';

export const assignOrganizationFeatureUseCase =
  new AssignOrganizationFeatureUseCase(
    organizationFeatureRepository,
    featureRepository,
  );

export const toggleOrganizationFeatureUseCase =
  new ToggleOrganizationFeatureUseCase(organizationFeatureRepository);

export const removeOrganizationFeatureUseCase =
  new RemoveOrganizationFeatureUseCase(organizationFeatureRepository);

export const getOrganizationFeaturesUseCase =
  new GetOrganizationFeaturesUseCase(organizationFeatureRepository);

export const getOrganizationAvailableFeaturesUseCase =
  new GetOrganizationAvailableFeaturesUseCase(organizationFeatureRepository);

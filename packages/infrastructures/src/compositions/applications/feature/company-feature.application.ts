import {
  AssignCompanyFeatureUseCase,
  GetCompanyAvailableFeaturesUseCase,
  GetCompanyFeaturesUseCase,
  RemoveCompanyFeatureUseCase,
  ToggleCompanyFeatureUseCase,
} from '@repo/applications';
import {
  companyFeatureRepository,
  featureRepository,
} from '../../repositories';

export const assignCompanyFeatureUseCase = new AssignCompanyFeatureUseCase(
  companyFeatureRepository,
  featureRepository,
);

export const toggleCompanyFeatureUseCase = new ToggleCompanyFeatureUseCase(
  companyFeatureRepository,
);

export const removeCompanyFeatureUseCase = new RemoveCompanyFeatureUseCase(
  companyFeatureRepository,
);

export const getCompanyFeaturesUseCase = new GetCompanyFeaturesUseCase(
  companyFeatureRepository,
);

export const getCompanyAvailableFeaturesUseCase =
  new GetCompanyAvailableFeaturesUseCase(companyFeatureRepository);

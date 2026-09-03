import {
  CreateFeatureUseCase,
  GetFeatureByIdUseCase,
  GetFeaturesUseCase,
  ToggleFeatureUseCase,
  UpdateFeatureUseCase,
} from '@repo/applications';
import { featureRepository } from '../../repositories';

export const createFeatureUseCase = new CreateFeatureUseCase(featureRepository);
export const updateFeatureUseCase = new UpdateFeatureUseCase(featureRepository);
export const toggleFeatureUseCase = new ToggleFeatureUseCase(featureRepository);
export const getFeaturesUseCase = new GetFeaturesUseCase(featureRepository);
export const getFeatureByIdUseCase = new GetFeatureByIdUseCase(
  featureRepository,
);

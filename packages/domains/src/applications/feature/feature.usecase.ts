import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Feature } from '#entities/feature';
import type { CreateFeature, UpdateFeature } from '#schema/feature';

// Context Types
export type ICreateFeatureContext = ISecurityContext & {
  data: CreateFeature;
};

export type IUpdateFeatureContext = ISecurityContext & {
  id: string;
  data: UpdateFeature;
};

export type IToggleFeatureContext = ISecurityContext & {
  id: string;
  isActive: boolean;
};

export type IGetFeaturesContext = ISecurityContext & {
  category?: string;
  isActive?: boolean;
};

export type IGetFeatureByIdContext = ISecurityContext & {
  id: string;
};

// Use Case Contracts
export type ICreateFeatureUseCase = BaseUseCase<ICreateFeatureContext, Feature>;
export type IUpdateFeatureUseCase = BaseUseCase<IUpdateFeatureContext, Feature>;
export type IToggleFeatureUseCase = BaseUseCase<IToggleFeatureContext, Feature>;
export type IGetFeaturesUseCase = BaseUseCase<
  IGetFeaturesContext | void,
  Feature[]
>;
export type IGetFeatureByIdUseCase = BaseUseCase<
  IGetFeatureByIdContext,
  Feature | null
>;

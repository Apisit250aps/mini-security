import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateFeatureContext,
  ICreateFeatureUseCase,
  IGetFeatureByIdContext,
  IGetFeatureByIdUseCase,
  IGetFeaturesContext,
  IGetFeaturesUseCase,
  IToggleFeatureContext,
  IToggleFeatureUseCase,
  IUpdateFeatureContext,
  IUpdateFeatureUseCase,
} from '@repo/domains/applications/feature';
import type { Feature } from '@repo/domains/entities/feature';
import type { IFeatureRepository } from '@repo/domains/repositories/feature';
import {
  createFeatureSchema,
  updateFeatureSchema,
} from '@repo/domains/schema/feature';
import { DuplicateError } from '../../lib/error';
import { requireEntityExists } from '../../lib/guards';
import { parseSchemaOrThrow } from '../../lib/validation';

export class CreateFeatureUseCase implements ICreateFeatureUseCase {
  constructor(private readonly featureRepository: IFeatureRepository) {}

  @RequirePermission('feature:create')
  async execute(context: ICreateFeatureContext): Promise<Feature> {
    const data = await parseSchemaOrThrow(
      createFeatureSchema,
      context.data,
      'Invalid feature data',
    );

    const existing = await this.featureRepository.findByCode(data.code);
    if (existing) {
      throw new DuplicateError(
        `Feature with code "${data.code}" already exists`,
      );
    }

    return this.featureRepository.create(data);
  }
}

export class UpdateFeatureUseCase implements IUpdateFeatureUseCase {
  constructor(private readonly featureRepository: IFeatureRepository) {}

  @RequirePermission('feature:update')
  async execute(context: IUpdateFeatureContext): Promise<Feature> {
    const existing = await requireEntityExists(
      () => this.featureRepository.findById(context.id),
      `Feature with id "${context.id}" not found`,
    );

    const data = await parseSchemaOrThrow(
      updateFeatureSchema,
      context.data,
      'Invalid update feature data',
    );

    if (data.code && data.code !== existing.code) {
      const duplicate = await this.featureRepository.findByCode(data.code);
      if (duplicate) {
        throw new DuplicateError(
          `Feature with code "${data.code}" already exists`,
        );
      }
    }

    return this.featureRepository.update(context.id, data);
  }
}

export class ToggleFeatureUseCase implements IToggleFeatureUseCase {
  constructor(private readonly featureRepository: IFeatureRepository) {}

  @RequirePermission('feature:toggle')
  async execute(context: IToggleFeatureContext): Promise<Feature> {
    await requireEntityExists(
      () => this.featureRepository.findById(context.id),
      `Feature with id "${context.id}" not found`,
    );

    return this.featureRepository.update(context.id, {
      isActive: context.isActive,
    });
  }
}

export class GetFeaturesUseCase implements IGetFeaturesUseCase {
  constructor(private readonly featureRepository: IFeatureRepository) {}

  @RequirePermission('feature:read')
  async execute(context?: IGetFeaturesContext): Promise<Feature[]> {
    if (context?.category) {
      return this.featureRepository.findByCategory(context.category);
    }
    if (context?.isActive) {
      return this.featureRepository.findActiveFeatures();
    }
    return this.featureRepository.findAll();
  }
}

export class GetFeatureByIdUseCase implements IGetFeatureByIdUseCase {
  constructor(private readonly featureRepository: IFeatureRepository) {}

  @RequirePermission('feature:read')
  async execute(context: IGetFeatureByIdContext): Promise<Feature | null> {
    return this.featureRepository.findById(context.id);
  }
}

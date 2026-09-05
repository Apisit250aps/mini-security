import type {
  IAssignCompanyFeatureContext,
  IAssignCompanyFeatureUseCase,
  IGetCompanyAvailableFeaturesContext,
  IGetCompanyAvailableFeaturesUseCase,
  IGetCompanyFeaturesContext,
  IGetCompanyFeaturesUseCase,
  IRemoveCompanyFeatureContext,
  IRemoveCompanyFeatureUseCase,
  IToggleCompanyFeatureContext,
  IToggleCompanyFeatureUseCase,
} from '@repo/domains/applications/feature';
import type { CompanyFeature, Feature } from '@repo/domains/entities/feature';
import type {
  ICompanyFeatureRepository,
  IFeatureRepository,
} from '@repo/domains/repositories/feature';
import { createCompanyFeatureSchema } from '@repo/domains/schema/feature';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class AssignCompanyFeatureUseCase
  implements IAssignCompanyFeatureUseCase
{
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  async execute(
    context: IAssignCompanyFeatureContext,
  ): Promise<CompanyFeature> {
    const parsed = await createCompanyFeatureSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid company feature assignment data',
        parsed.error.format(),
      );
    }

    const feature = await this.featureRepository.findById(
      parsed.data.featureId,
    );
    if (!feature) {
      throw new NotFoundError(
        `Feature with id "${parsed.data.featureId}" not found`,
      );
    }

    const existing =
      await this.companyFeatureRepository.findByCompanyAndFeature(
        parsed.data.companyId,
        parsed.data.featureId,
      );
    if (existing) {
      throw new DuplicateError('Feature is already assigned to this company');
    }

    return this.companyFeatureRepository.create(parsed.data);
  }
}

export class ToggleCompanyFeatureUseCase
  implements IToggleCompanyFeatureUseCase
{
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
  ) {}

  async execute(
    context: IToggleCompanyFeatureContext,
  ): Promise<CompanyFeature> {
    const existing =
      await this.companyFeatureRepository.findByCompanyAndFeature(
        context.companyId,
        context.featureId,
      );

    if (!existing) {
      // If not yet assigned, create entitlement with the specified enabled status
      return this.companyFeatureRepository.create({
        companyId: context.companyId,
        featureId: context.featureId,
        isEnabled: context.isEnabled,
      });
    }

    return this.companyFeatureRepository.toggleFeature(
      context.companyId,
      context.featureId,
      context.isEnabled,
    );
  }
}

export class RemoveCompanyFeatureUseCase
  implements IRemoveCompanyFeatureUseCase
{
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
  ) {}

  async execute(context: IRemoveCompanyFeatureContext): Promise<void> {
    await this.companyFeatureRepository.deleteByCompanyAndFeature(
      context.companyId,
      context.featureId,
    );
  }
}

export class GetCompanyFeaturesUseCase implements IGetCompanyFeaturesUseCase {
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
  ) {}

  async execute(
    context: IGetCompanyFeaturesContext,
  ): Promise<CompanyFeature[]> {
    if (context.onlyEnabled) {
      return this.companyFeatureRepository.findActiveByCompanyId(
        context.companyId,
      );
    }
    return this.companyFeatureRepository.findByCompanyId(context.companyId);
  }
}

export class GetCompanyAvailableFeaturesUseCase
  implements IGetCompanyAvailableFeaturesUseCase
{
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
  ) {}

  async execute(
    context: IGetCompanyAvailableFeaturesContext,
  ): Promise<Feature[]> {
    return this.companyFeatureRepository.findFeaturesByCompanyId(
      context.companyId,
      true, // only active & enabled features
    );
  }
}

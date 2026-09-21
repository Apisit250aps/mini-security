import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IAssignOrganizationFeatureContext,
  IAssignOrganizationFeatureUseCase,
  IGetOrganizationAvailableFeaturesContext,
  IGetOrganizationAvailableFeaturesUseCase,
  IGetOrganizationFeaturesContext,
  IGetOrganizationFeaturesUseCase,
  IRemoveOrganizationFeatureContext,
  IRemoveOrganizationFeatureUseCase,
  IToggleOrganizationFeatureContext,
  IToggleOrganizationFeatureUseCase,
} from '@repo/domains/applications/feature';
import type {
  OrganizationFeature,
  Feature,
} from '@repo/domains/entities/feature';
import type {
  IOrganizationFeatureRepository,
  IFeatureRepository,
} from '@repo/domains/repositories/feature';
import { createOrganizationFeatureSchema } from '@repo/domains/schema/feature';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class AssignOrganizationFeatureUseCase
  implements IAssignOrganizationFeatureUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  @RequirePermission('organization_feature:create')
  async execute(
    context: IAssignOrganizationFeatureContext,
  ): Promise<OrganizationFeature> {
    const parsed = await createOrganizationFeatureSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid organization feature assignment data',
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
      await this.organizationFeatureRepository.findByOrganizationAndFeature(
        parsed.data.organizationId,
        parsed.data.featureId,
      );
    if (existing) {
      throw new DuplicateError(
        'Feature is already assigned to this organization',
      );
    }

    return this.organizationFeatureRepository.create(parsed.data);
  }
}

export class ToggleOrganizationFeatureUseCase
  implements IToggleOrganizationFeatureUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
  ) {}

  @RequirePermission('organization_feature:toggle')
  async execute(
    context: IToggleOrganizationFeatureContext,
  ): Promise<OrganizationFeature> {
    const existing =
      await this.organizationFeatureRepository.findByOrganizationAndFeature(
        context.organizationId,
        context.featureId,
      );

    if (!existing) {
      // If not yet assigned, create entitlement with the specified enabled status
      return this.organizationFeatureRepository.create({
        organizationId: context.organizationId,
        featureId: context.featureId,
        isEnabled: context.isEnabled,
      });
    }

    return this.organizationFeatureRepository.toggleFeature(
      context.organizationId,
      context.featureId,
      context.isEnabled,
    );
  }
}

export class RemoveOrganizationFeatureUseCase
  implements IRemoveOrganizationFeatureUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
  ) {}

  @RequirePermission('organization_feature:delete')
  async execute(context: IRemoveOrganizationFeatureContext): Promise<void> {
    await this.organizationFeatureRepository.deleteByOrganizationAndFeature(
      context.organizationId,
      context.featureId,
    );
  }
}

export class GetOrganizationFeaturesUseCase
  implements IGetOrganizationFeaturesUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
  ) {}

  @RequirePermission('organization_feature:read')
  async execute(
    context: IGetOrganizationFeaturesContext,
  ): Promise<OrganizationFeature[]> {
    if (context.onlyEnabled) {
      return this.organizationFeatureRepository.findActiveByOrganizationId(
        context.organizationId,
      );
    }
    return this.organizationFeatureRepository.findByOrganizationId(
      context.organizationId,
    );
  }
}

export class GetOrganizationAvailableFeaturesUseCase
  implements IGetOrganizationAvailableFeaturesUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
  ) {}

  @RequirePermission('organization_feature:read')
  async execute(
    context: IGetOrganizationAvailableFeaturesContext,
  ): Promise<Feature[]> {
    return this.organizationFeatureRepository.findFeaturesByOrganizationId(
      context.organizationId,
      true, // only active & enabled features
    );
  }
}

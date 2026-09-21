import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IAssignRoleFeatureContext,
  IAssignRoleFeatureUseCase,
  ICheckRoleFeatureAccessContext,
  ICheckRoleFeatureAccessUseCase,
  IGetOrganizationRoleFeaturesContext,
  IGetOrganizationRoleFeaturesUseCase,
  IGetRoleFeaturesContext,
  IGetRoleFeaturesUseCase,
  IRevokeRoleFeatureContext,
  IRevokeRoleFeatureUseCase,
  IToggleRoleFeatureContext,
  IToggleRoleFeatureUseCase,
} from '@repo/domains/applications/feature';
import type { Feature, RoleFeature } from '@repo/domains/entities/feature';
import type {
  IOrganizationFeatureRepository,
  IFeatureRepository,
  IRoleFeatureRepository,
} from '@repo/domains/repositories/feature';
import { createRoleFeatureSchema } from '@repo/domains/schema/feature';
import {
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class AssignRoleFeatureUseCase implements IAssignRoleFeatureUseCase {
  constructor(
    private readonly roleFeatureRepository: IRoleFeatureRepository,
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  @RequirePermission('role_feature:create')
  async execute(context: IAssignRoleFeatureContext): Promise<RoleFeature> {
    const parsed = await createRoleFeatureSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid role feature assignment data',
        parsed.error.format(),
      );
    }

    // 1. Verify feature exists
    const feature = await this.featureRepository.findById(
      parsed.data.featureId,
    );
    if (!feature) {
      throw new NotFoundError(
        `Feature with id "${parsed.data.featureId}" not found`,
      );
    }

    // 2. Domain Invariant: Organization must have an active entitlement for this feature
    const organizationFeature =
      await this.organizationFeatureRepository.findByOrganizationAndFeature(
        parsed.data.organizationId,
        parsed.data.featureId,
      );

    if (!organizationFeature || !organizationFeature.isEnabled) {
      throw new ForbiddenError(
        'Cannot assign feature: This organization does not have an active entitlement for this feature',
      );
    }

    // 3. Check duplicate assignment
    const existing = await this.roleFeatureRepository.findByRoleAndFeature(
      parsed.data.roleId,
      parsed.data.featureId,
    );
    if (existing) {
      throw new DuplicateError('This role already has this feature assigned');
    }

    return this.roleFeatureRepository.create(parsed.data);
  }
}

export class ToggleRoleFeatureUseCase implements IToggleRoleFeatureUseCase {
  constructor(private readonly roleFeatureRepository: IRoleFeatureRepository) {}

  @RequirePermission('role_feature:toggle')
  async execute(context: IToggleRoleFeatureContext): Promise<RoleFeature> {
    const existing = await this.roleFeatureRepository.findByRoleAndFeature(
      context.roleId,
      context.featureId,
    );

    if (!existing) {
      return this.roleFeatureRepository.create({
        organizationId: context.organizationId,
        roleId: context.roleId,
        featureId: context.featureId,
        isEnabled: context.isEnabled,
      });
    }

    return this.roleFeatureRepository.update(existing.id, {
      isEnabled: context.isEnabled,
    });
  }
}

export class RevokeRoleFeatureUseCase implements IRevokeRoleFeatureUseCase {
  constructor(private readonly roleFeatureRepository: IRoleFeatureRepository) {}

  @RequirePermission('role_feature:delete')
  async execute(context: IRevokeRoleFeatureContext): Promise<void> {
    await this.roleFeatureRepository.deleteByRoleAndFeature(
      context.roleId,
      context.featureId,
    );
  }
}

export class GetRoleFeaturesUseCase implements IGetRoleFeaturesUseCase {
  constructor(private readonly roleFeatureRepository: IRoleFeatureRepository) {}

  @RequirePermission('role_feature:read')
  async execute(context: IGetRoleFeaturesContext): Promise<Feature[]> {
    return this.roleFeatureRepository.findFeaturesByRoleId(context.roleId);
  }
}

export class GetOrganizationRoleFeaturesUseCase
  implements IGetOrganizationRoleFeaturesUseCase
{
  constructor(private readonly roleFeatureRepository: IRoleFeatureRepository) {}

  @RequirePermission('role_feature:read')
  async execute(
    context: IGetOrganizationRoleFeaturesContext,
  ): Promise<RoleFeature[]> {
    return this.roleFeatureRepository.findByOrganizationId(
      context.organizationId,
    );
  }
}

export class CheckRoleFeatureAccessUseCase
  implements ICheckRoleFeatureAccessUseCase
{
  constructor(
    private readonly organizationFeatureRepository: IOrganizationFeatureRepository,
    private readonly roleFeatureRepository: IRoleFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  @RequirePermission('role_feature:check')
  async execute(context: ICheckRoleFeatureAccessContext): Promise<boolean> {
    // 1. Find feature by code
    const feature = await this.featureRepository.findByCode(
      context.featureCode,
    );
    if (!feature || !feature.isActive) return false;

    // 2. Check organization entitlement
    const organizationFeature =
      await this.organizationFeatureRepository.findByOrganizationAndFeature(
        context.organizationId,
        feature.id,
      );
    if (!organizationFeature || !organizationFeature.isEnabled) return false;

    // 3. Check role assignment
    const roleFeature = await this.roleFeatureRepository.findByRoleAndFeature(
      context.roleId,
      feature.id,
    );
    return Boolean(roleFeature && roleFeature.isEnabled);
  }
}

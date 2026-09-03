import type {
  IAssignRoleFeatureContext,
  IAssignRoleFeatureUseCase,
  ICheckRoleFeatureAccessContext,
  ICheckRoleFeatureAccessUseCase,
  IGetCompanyRoleFeaturesContext,
  IGetCompanyRoleFeaturesUseCase,
  IGetRoleFeaturesContext,
  IGetRoleFeaturesUseCase,
  IRevokeRoleFeatureContext,
  IRevokeRoleFeatureUseCase,
  IToggleRoleFeatureContext,
  IToggleRoleFeatureUseCase,
} from '@repo/domains/applications/feature';
import type { Feature, RoleFeature } from '@repo/domains/entities/feature';
import type {
  ICompanyFeatureRepository,
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
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  async execute(context: IAssignRoleFeatureContext): Promise<RoleFeature> {
    const parsed = await createRoleFeatureSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid role feature assignment data',
        parsed.error.format(),
      );
    }

    // 1. Verify feature exists
    const feature = await this.featureRepository.findById(parsed.data.featureId);
    if (!feature) {
      throw new NotFoundError(
        `Feature with id "${parsed.data.featureId}" not found`,
      );
    }

    // 2. Domain Invariant: Company must have an active entitlement for this feature
    const companyFeature =
      await this.companyFeatureRepository.findByCompanyAndFeature(
        parsed.data.companyId,
        parsed.data.featureId,
      );

    if (!companyFeature || !companyFeature.isEnabled) {
      throw new ForbiddenError(
        'Cannot assign feature: This company does not have an active entitlement for this feature',
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
  constructor(
    private readonly roleFeatureRepository: IRoleFeatureRepository,
  ) {}

  async execute(context: IToggleRoleFeatureContext): Promise<RoleFeature> {
    const existing = await this.roleFeatureRepository.findByRoleAndFeature(
      context.roleId,
      context.featureId,
    );

    if (!existing) {
      return this.roleFeatureRepository.create({
        companyId: context.companyId,
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
  constructor(
    private readonly roleFeatureRepository: IRoleFeatureRepository,
  ) {}

  async execute(context: IRevokeRoleFeatureContext): Promise<void> {
    await this.roleFeatureRepository.deleteByRoleAndFeature(
      context.roleId,
      context.featureId,
    );
  }
}

export class GetRoleFeaturesUseCase implements IGetRoleFeaturesUseCase {
  constructor(
    private readonly roleFeatureRepository: IRoleFeatureRepository,
  ) {}

  async execute(context: IGetRoleFeaturesContext): Promise<Feature[]> {
    return this.roleFeatureRepository.findFeaturesByRoleId(context.roleId);
  }
}

export class GetCompanyRoleFeaturesUseCase
  implements IGetCompanyRoleFeaturesUseCase
{
  constructor(
    private readonly roleFeatureRepository: IRoleFeatureRepository,
  ) {}

  async execute(
    context: IGetCompanyRoleFeaturesContext,
  ): Promise<RoleFeature[]> {
    return this.roleFeatureRepository.findByCompanyId(context.companyId);
  }
}

export class CheckRoleFeatureAccessUseCase
  implements ICheckRoleFeatureAccessUseCase
{
  constructor(
    private readonly companyFeatureRepository: ICompanyFeatureRepository,
    private readonly roleFeatureRepository: IRoleFeatureRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {}

  async execute(context: ICheckRoleFeatureAccessContext): Promise<boolean> {
    // 1. Find feature by code
    const feature = await this.featureRepository.findByCode(
      context.featureCode,
    );
    if (!feature || !feature.isActive) return false;

    // 2. Check company entitlement
    const companyFeature =
      await this.companyFeatureRepository.findByCompanyAndFeature(
        context.companyId,
        feature.id,
      );
    if (!companyFeature || !companyFeature.isEnabled) return false;

    // 3. Check role assignment
    const roleFeature =
      await this.roleFeatureRepository.findByRoleAndFeature(
        context.roleId,
        feature.id,
      );
    return Boolean(roleFeature && roleFeature.isEnabled);
  }
}

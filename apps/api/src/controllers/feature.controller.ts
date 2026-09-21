import { z } from 'zod';
import {
  AssignOrganizationFeatureUseCase,
  AssignRoleFeatureUseCase,
  CheckRoleFeatureAccessUseCase,
  CreateFeatureUseCase,
  GetOrganizationAvailableFeaturesUseCase,
  GetOrganizationFeaturesUseCase,
  GetOrganizationRoleFeaturesUseCase,
  GetFeatureByIdUseCase,
  GetFeaturesUseCase,
  GetRoleFeaturesUseCase,
  RemoveOrganizationFeatureUseCase,
  RevokeRoleFeatureUseCase,
  ToggleOrganizationFeatureUseCase,
  ToggleFeatureUseCase,
  ToggleRoleFeatureUseCase,
  UpdateFeatureUseCase,
} from '@repo/applications';
import {
  featureSchema,
  organizationFeatureSchema,
  roleFeatureSchema,
  createOrganizationFeatureSchema,
  createFeatureSchema,
  createRoleFeatureSchema,
  updateFeatureSchema,
} from '@repo/domains/schema/feature';
import Controller from './base.controller';

const idParamSchema = featureSchema.pick({ id: true });

const organizationIdParamSchema = organizationFeatureSchema.pick({
  organizationId: true,
});

const roleIdParamSchema = roleFeatureSchema.pick({ roleId: true });

const organizationFeatureParamSchema = organizationFeatureSchema.pick({
  organizationId: true,
  featureId: true,
});

const roleFeatureParamSchema = roleFeatureSchema.pick({
  roleId: true,
  featureId: true,
});

const roleAccessParamSchema = z.object({
  organizationId: roleFeatureSchema.shape.organizationId,
  roleId: roleFeatureSchema.shape.roleId,
  featureCode: featureSchema.shape.code,
});

const toggleFeatureBodySchema = featureSchema.pick({ isActive: true });

const organizationToggleBodySchema = organizationFeatureSchema.pick({
  featureId: true,
  isEnabled: true,
});

const roleToggleBodySchema = roleFeatureSchema.pick({
  organizationId: true,
  featureId: true,
  isEnabled: true,
});

export class FeatureController extends Controller {
  constructor(
    private readonly createFeatureUseCase: CreateFeatureUseCase,
    private readonly updateFeatureUseCase: UpdateFeatureUseCase,
    private readonly toggleFeatureUseCase: ToggleFeatureUseCase,
    private readonly getFeaturesUseCase: GetFeaturesUseCase,
    private readonly getFeatureByIdUseCase: GetFeatureByIdUseCase,
    private readonly assignOrganizationFeatureUseCase: AssignOrganizationFeatureUseCase,
    private readonly toggleOrganizationFeatureUseCase: ToggleOrganizationFeatureUseCase,
    private readonly removeOrganizationFeatureUseCase: RemoveOrganizationFeatureUseCase,
    private readonly getOrganizationFeaturesUseCase: GetOrganizationFeaturesUseCase,
    private readonly getOrganizationAvailableFeaturesUseCase: GetOrganizationAvailableFeaturesUseCase,
    private readonly assignRoleFeatureUseCase: AssignRoleFeatureUseCase,
    private readonly toggleRoleFeatureUseCase: ToggleRoleFeatureUseCase,
    private readonly revokeRoleFeatureUseCase: RevokeRoleFeatureUseCase,
    private readonly getRoleFeaturesUseCase: GetRoleFeaturesUseCase,
    private readonly getOrganizationRoleFeaturesUseCase: GetOrganizationRoleFeaturesUseCase,
    private readonly checkRoleFeatureAccessUseCase: CheckRoleFeatureAccessUseCase,
  ) {
    super();
  }

  /**
   * Master Features
   */

  public getFeatures = async (c: Parameters<typeof this.success>[0]) => {
    const category = c.req.query('category');
    const isActiveStr = c.req.query('isActive');
    const isActive =
      isActiveStr !== undefined ? isActiveStr === 'true' : undefined;

    const features = await this.getFeaturesUseCase.execute({
      ...this.securityContext(c),
      category,
      isActive,
    });
    return this.success(c, 'Features retrieved successfully', features);
  };

  public getFeature = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const feature = await this.getFeatureByIdUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Feature retrieved successfully', feature);
  });

  public createFeature = this.validator(
    { body: createFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const feature = await this.createFeatureUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Feature created successfully', feature);
    },
  );

  public updateFeature = this.validator(
    { params: idParamSchema, body: updateFeatureSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const feature = await this.updateFeatureUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Feature updated successfully', feature);
    },
  );

  public toggleFeature = this.validator(
    { params: idParamSchema, body: toggleFeatureBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { isActive } = c.get('body');
      const feature = await this.toggleFeatureUseCase.execute({
        ...this.securityContext(c),
        id,
        isActive,
      });
      return this.success(c, 'Feature status updated successfully', feature);
    },
  );

  /**
   * Organization Features (Entitlement & Toggles)
   */

  public getOrganizationFeatures = this.validator(
    { params: organizationIdParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const onlyEnabled = c.req.query('onlyEnabled') === 'true';

      const organizationFeatures =
        await this.getOrganizationFeaturesUseCase.execute({
          ...this.securityContext(c),
          organizationId,
          onlyEnabled,
        });
      return this.success(
        c,
        'Organization features retrieved successfully',
        organizationFeatures,
      );
    },
  );

  public getOrganizationAvailableFeatures = this.validator(
    { params: organizationIdParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const features =
        await this.getOrganizationAvailableFeaturesUseCase.execute({
          ...this.securityContext(c),
          organizationId,
        });
      return this.success(
        c,
        'Organization available features retrieved successfully',
        features,
      );
    },
  );

  public assignOrganizationFeature = this.validator(
    { body: createOrganizationFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignOrganizationFeatureUseCase.execute({
        ...this.securityContext(c),
        data: {
          ...body,
          assignedBy: user?.id ?? null,
        },
      });
      return this.created(
        c,
        'Organization feature assigned successfully',
        result,
      );
    },
  );

  public toggleOrganizationFeature = this.validator(
    {
      params: organizationIdParamSchema,
      body: organizationToggleBodySchema,
    },
    async (c) => {
      const { organizationId } = c.get('params');
      const { featureId, isEnabled } = c.get('body');
      const result = await this.toggleOrganizationFeatureUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        featureId,
        isEnabled,
      });
      return this.success(
        c,
        'Organization feature toggled successfully',
        result,
      );
    },
  );

  public removeOrganizationFeature = this.validator(
    { params: organizationFeatureParamSchema },
    async (c) => {
      const { organizationId, featureId } = c.get('params');
      await this.removeOrganizationFeatureUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        featureId,
      });
      return this.success(c, 'Organization feature removed successfully');
    },
  );

  /**
   * Role Features (Delegation)
   */

  public getRoleFeatures = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const features = await this.getRoleFeaturesUseCase.execute({
        ...this.securityContext(c),
        roleId,
      });
      return this.success(c, 'Role features retrieved successfully', features);
    },
  );

  public getOrganizationRoleFeatures = this.validator(
    { params: organizationIdParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const roleFeatures =
        await this.getOrganizationRoleFeaturesUseCase.execute({
          ...this.securityContext(c),
          organizationId,
        });
      return this.success(
        c,
        'Organization role features retrieved successfully',
        roleFeatures,
      );
    },
  );

  public assignRoleFeature = this.validator(
    { body: createRoleFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const result = await this.assignRoleFeatureUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Role feature assigned successfully', result);
    },
  );

  public toggleRoleFeature = this.validator(
    { params: roleIdParamSchema, body: roleToggleBodySchema },
    async (c) => {
      const { roleId } = c.get('params');
      const { organizationId, featureId, isEnabled } = c.get('body');
      const result = await this.toggleRoleFeatureUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        roleId,
        featureId,
        isEnabled,
      });
      return this.success(c, 'Role feature toggled successfully', result);
    },
  );

  public revokeRoleFeature = this.validator(
    { params: roleFeatureParamSchema },
    async (c) => {
      const { roleId, featureId } = c.get('params');
      const organizationId = c.req.query('organizationId') || '';
      await this.revokeRoleFeatureUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        roleId,
        featureId,
      });
      return this.success(c, 'Role feature revoked successfully');
    },
  );

  public checkRoleFeatureAccess = this.validator(
    { params: roleAccessParamSchema },
    async (c) => {
      const { organizationId, roleId, featureCode } = c.get('params');
      const hasAccess = await this.checkRoleFeatureAccessUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        roleId,
        featureCode,
      });
      return this.success(c, 'Access check completed', { hasAccess });
    },
  );
}

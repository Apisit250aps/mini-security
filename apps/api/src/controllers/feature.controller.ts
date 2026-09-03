import { z } from 'zod';
import {
  AssignCompanyFeatureUseCase,
  AssignRoleFeatureUseCase,
  CheckRoleFeatureAccessUseCase,
  CreateFeatureUseCase,
  GetCompanyAvailableFeaturesUseCase,
  GetCompanyFeaturesUseCase,
  GetCompanyRoleFeaturesUseCase,
  GetFeatureByIdUseCase,
  GetFeaturesUseCase,
  GetRoleFeaturesUseCase,
  RemoveCompanyFeatureUseCase,
  RevokeRoleFeatureUseCase,
  ToggleCompanyFeatureUseCase,
  ToggleFeatureUseCase,
  ToggleRoleFeatureUseCase,
  UpdateFeatureUseCase,
} from '@repo/applications';
import {
  createCompanyFeatureSchema,
  createFeatureSchema,
  createRoleFeatureSchema,
  updateFeatureSchema,
} from '@repo/domains/schema/feature';
import Controller from './base.controller';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const companyIdParamSchema = z.object({
  companyId: z.string().uuid(),
});

const roleIdParamSchema = z.object({
  roleId: z.string().uuid(),
});

const companyFeatureParamSchema = z.object({
  companyId: z.string().uuid(),
  featureId: z.string().uuid(),
});

const roleFeatureParamSchema = z.object({
  roleId: z.string().uuid(),
  featureId: z.string().uuid(),
});

const roleAccessParamSchema = z.object({
  companyId: z.string().uuid(),
  roleId: z.string().uuid(),
  featureCode: z.string().min(1),
});

const toggleFeatureBodySchema = z.object({
  isActive: z.boolean(),
});

const companyToggleBodySchema = z.object({
  featureId: z.string().uuid(),
  isEnabled: z.boolean(),
});

const roleToggleBodySchema = z.object({
  companyId: z.string().uuid(),
  featureId: z.string().uuid(),
  isEnabled: z.boolean(),
});

export class FeatureController extends Controller {
  constructor(
    private readonly createFeatureUseCase: CreateFeatureUseCase,
    private readonly updateFeatureUseCase: UpdateFeatureUseCase,
    private readonly toggleFeatureUseCase: ToggleFeatureUseCase,
    private readonly getFeaturesUseCase: GetFeaturesUseCase,
    private readonly getFeatureByIdUseCase: GetFeatureByIdUseCase,
    private readonly assignCompanyFeatureUseCase: AssignCompanyFeatureUseCase,
    private readonly toggleCompanyFeatureUseCase: ToggleCompanyFeatureUseCase,
    private readonly removeCompanyFeatureUseCase: RemoveCompanyFeatureUseCase,
    private readonly getCompanyFeaturesUseCase: GetCompanyFeaturesUseCase,
    private readonly getCompanyAvailableFeaturesUseCase: GetCompanyAvailableFeaturesUseCase,
    private readonly assignRoleFeatureUseCase: AssignRoleFeatureUseCase,
    private readonly toggleRoleFeatureUseCase: ToggleRoleFeatureUseCase,
    private readonly revokeRoleFeatureUseCase: RevokeRoleFeatureUseCase,
    private readonly getRoleFeaturesUseCase: GetRoleFeaturesUseCase,
    private readonly getCompanyRoleFeaturesUseCase: GetCompanyRoleFeaturesUseCase,
    private readonly checkRoleFeatureAccessUseCase: CheckRoleFeatureAccessUseCase,
  ) {
    super();
  }

  // ==========================================
  // Master Features
  // ==========================================

  public getFeatures = async (c: Parameters<typeof this.success>[0]) => {
    const category = c.req.query('category');
    const isActiveStr = c.req.query('isActive');
    const isActive =
      isActiveStr !== undefined ? isActiveStr === 'true' : undefined;

    const features = await this.getFeaturesUseCase.execute({
      category,
      isActive,
    });
    return this.success(c, 'Features retrieved successfully', features);
  };

  public getFeature = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const feature = await this.getFeatureByIdUseCase.execute({ id });
    return this.success(c, 'Feature retrieved successfully', feature);
  });

  public createFeature = this.validator(
    { body: createFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const feature = await this.createFeatureUseCase.execute({ data: body });
      return this.created(c, 'Feature created successfully', feature);
    },
  );

  public updateFeature = this.validator(
    { params: idParamSchema, body: updateFeatureSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const feature = await this.updateFeatureUseCase.execute({
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
      const feature = await this.toggleFeatureUseCase.execute({ id, isActive });
      return this.success(c, 'Feature status updated successfully', feature);
    },
  );

  // ==========================================
  // Company Features (Entitlement & Toggles)
  // ==========================================

  public getCompanyFeatures = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const onlyEnabled = c.req.query('onlyEnabled') === 'true';

      const companyFeatures = await this.getCompanyFeaturesUseCase.execute({
        companyId,
        onlyEnabled,
      });
      return this.success(
        c,
        'Company features retrieved successfully',
        companyFeatures,
      );
    },
  );

  public getCompanyAvailableFeatures = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const features = await this.getCompanyAvailableFeaturesUseCase.execute({
        companyId,
      });
      return this.success(
        c,
        'Company available features retrieved successfully',
        features,
      );
    },
  );

  public assignCompanyFeature = this.validator(
    { body: createCompanyFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignCompanyFeatureUseCase.execute({
        data: {
          ...body,
          assignedBy: user?.id ?? null,
        },
      });
      return this.created(c, 'Company feature assigned successfully', result);
    },
  );

  public toggleCompanyFeature = this.validator(
    { params: companyIdParamSchema, body: companyToggleBodySchema },
    async (c) => {
      const { companyId } = c.get('params');
      const { featureId, isEnabled } = c.get('body');
      const result = await this.toggleCompanyFeatureUseCase.execute({
        companyId,
        featureId,
        isEnabled,
      });
      return this.success(c, 'Company feature toggled successfully', result);
    },
  );

  public removeCompanyFeature = this.validator(
    { params: companyFeatureParamSchema },
    async (c) => {
      const { companyId, featureId } = c.get('params');
      await this.removeCompanyFeatureUseCase.execute({
        companyId,
        featureId,
      });
      return this.success(c, 'Company feature removed successfully');
    },
  );

  // ==========================================
  // Role Features (Delegation)
  // ==========================================

  public getRoleFeatures = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const features = await this.getRoleFeaturesUseCase.execute({ roleId });
      return this.success(c, 'Role features retrieved successfully', features);
    },
  );

  public getCompanyRoleFeatures = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const roleFeatures = await this.getCompanyRoleFeaturesUseCase.execute({
        companyId,
      });
      return this.success(
        c,
        'Company role features retrieved successfully',
        roleFeatures,
      );
    },
  );

  public assignRoleFeature = this.validator(
    { body: createRoleFeatureSchema },
    async (c) => {
      const body = c.get('body');
      const result = await this.assignRoleFeatureUseCase.execute({
        data: body,
      });
      return this.created(c, 'Role feature assigned successfully', result);
    },
  );

  public toggleRoleFeature = this.validator(
    { params: roleIdParamSchema, body: roleToggleBodySchema },
    async (c) => {
      const { roleId } = c.get('params');
      const { companyId, featureId, isEnabled } = c.get('body');
      const result = await this.toggleRoleFeatureUseCase.execute({
        companyId,
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
      const companyId = c.req.query('companyId') || '';
      await this.revokeRoleFeatureUseCase.execute({
        companyId,
        roleId,
        featureId,
      });
      return this.success(c, 'Role feature revoked successfully');
    },
  );

  public checkRoleFeatureAccess = this.validator(
    { params: roleAccessParamSchema },
    async (c) => {
      const { companyId, roleId, featureCode } = c.get('params');
      const hasAccess = await this.checkRoleFeatureAccessUseCase.execute({
        companyId,
        roleId,
        featureCode,
      });
      return this.success(c, 'Access check completed', { hasAccess });
    },
  );
}

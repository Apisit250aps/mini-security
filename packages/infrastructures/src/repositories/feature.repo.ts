import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  organizationFeature,
  feature,
  roleFeature,
} from '@repo/database/schema';
import {
  OrganizationFeature,
  Feature,
  RoleFeature,
} from '@repo/domains/entities';
import type {
  IOrganizationFeatureRepository,
  IFeatureRepository,
  IRoleFeatureRepository,
} from '@repo/domains/repositories/feature';
import type {
  CreateOrganizationFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateOrganizationFeature,
  UpdateFeature,
  UpdateRoleFeature,
} from '@repo/domains/schema/feature';

export class FeatureRepository
  extends Repository<Feature, CreateFeature, UpdateFeature>
  implements IFeatureRepository
{
  constructor(db: Database) {
    super(db, feature);
  }

  async findByCode(code: string): Promise<Feature | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(feature.code, code));
    return result ? new Feature(result as unknown as Feature) : null;
  }

  async findByCategory(category: string): Promise<Feature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(feature.category, category));
    return results.map((r) => new Feature(r as unknown as Feature));
  }

  async findActiveFeatures(): Promise<Feature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(feature.isActive, true));
    return results.map((r) => new Feature(r as unknown as Feature));
  }
}

export class OrganizationFeatureRepository
  extends Repository<
    OrganizationFeature,
    CreateOrganizationFeature,
    UpdateOrganizationFeature
  >
  implements IOrganizationFeatureRepository
{
  constructor(db: Database) {
    super(db, organizationFeature);
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(organizationFeature.organizationId, organizationId));
    return results.map(
      (r) => new OrganizationFeature(r as unknown as OrganizationFeature),
    );
  }

  async findActiveByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(organizationFeature.organizationId, organizationId),
          eq(organizationFeature.isEnabled, true),
        ),
      );
    return results.map(
      (r) => new OrganizationFeature(r as unknown as OrganizationFeature),
    );
  }

  async findByOrganizationAndFeature(
    organizationId: string,
    featureId: string,
  ): Promise<OrganizationFeature | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(organizationFeature.organizationId, organizationId),
          eq(organizationFeature.featureId, featureId),
        ),
      );
    return result
      ? new OrganizationFeature(result as unknown as OrganizationFeature)
      : null;
  }

  async findByOrganizationAndFeatureCode(
    organizationId: string,
    featureCode: string,
  ): Promise<OrganizationFeature | null> {
    const [result] = await this.db
      .select({
        id: organizationFeature.id,
        organizationId: organizationFeature.organizationId,
        featureId: organizationFeature.featureId,
        isEnabled: organizationFeature.isEnabled,
        assignedBy: organizationFeature.assignedBy,
        expiresAt: organizationFeature.expiresAt,
        createdAt: organizationFeature.createdAt,
        updatedAt: organizationFeature.updatedAt,
      })
      .from(organizationFeature)
      .innerJoin(feature, eq(organizationFeature.featureId, feature.id))
      .where(
        and(
          eq(organizationFeature.organizationId, organizationId),
          eq(feature.code, featureCode),
        ),
      );
    return result
      ? new OrganizationFeature(result as unknown as OrganizationFeature)
      : null;
  }

  async findFeaturesByOrganizationId(
    organizationId: string,
    onlyEnabled = true,
  ): Promise<Feature[]> {
    const condition = onlyEnabled
      ? and(
          eq(organizationFeature.organizationId, organizationId),
          eq(organizationFeature.isEnabled, true),
          eq(feature.isActive, true),
        )
      : eq(organizationFeature.organizationId, organizationId);

    const results = await this.db
      .select({
        id: feature.id,
        code: feature.code,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        isActive: feature.isActive,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
      })
      .from(feature)
      .innerJoin(
        organizationFeature,
        eq(feature.id, organizationFeature.featureId),
      )
      .where(condition);

    return results.map((r) => new Feature(r as unknown as Feature));
  }

  async toggleFeature(
    organizationId: string,
    featureId: string,
    isEnabled: boolean,
  ): Promise<OrganizationFeature> {
    const existing = await this.findByOrganizationAndFeature(
      organizationId,
      featureId,
    );
    if (!existing) {
      return this.create({
        organizationId,
        featureId,
        isEnabled,
      });
    }

    const [updated] = await this.db
      .update(this.table)
      .set({ isEnabled, updatedAt: new Date() })
      .where(
        and(
          eq(organizationFeature.organizationId, organizationId),
          eq(organizationFeature.featureId, featureId),
        ),
      )
      .returning();

    return new OrganizationFeature(updated as unknown as OrganizationFeature);
  }

  async deleteByOrganizationAndFeature(
    organizationId: string,
    featureId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(organizationFeature.organizationId, organizationId),
          eq(organizationFeature.featureId, featureId),
        ),
      );
  }
}

export class RoleFeatureRepository
  extends Repository<RoleFeature, CreateRoleFeature, UpdateRoleFeature>
  implements IRoleFeatureRepository
{
  constructor(db: Database) {
    super(db, roleFeature);
  }

  async findByRoleId(roleId: string): Promise<RoleFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleFeature.roleId, roleId));
    return results.map((r) => new RoleFeature(r as unknown as RoleFeature));
  }

  async findByOrganizationId(organizationId: string): Promise<RoleFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleFeature.organizationId, organizationId));
    return results.map((r) => new RoleFeature(r as unknown as RoleFeature));
  }

  async findByRoleAndFeature(
    roleId: string,
    featureId: string,
  ): Promise<RoleFeature | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(roleFeature.roleId, roleId),
          eq(roleFeature.featureId, featureId),
        ),
      );
    return result ? new RoleFeature(result as unknown as RoleFeature) : null;
  }

  async findFeaturesByRoleId(roleId: string): Promise<Feature[]> {
    const results = await this.db
      .select({
        id: feature.id,
        code: feature.code,
        name: feature.name,
        description: feature.description,
        category: feature.category,
        isActive: feature.isActive,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt,
      })
      .from(feature)
      .innerJoin(roleFeature, eq(feature.id, roleFeature.featureId))
      .where(
        and(
          eq(roleFeature.roleId, roleId),
          eq(roleFeature.isEnabled, true),
          eq(feature.isActive, true),
        ),
      );

    return results.map((r) => new Feature(r as unknown as Feature));
  }

  async deleteByRoleAndFeature(
    roleId: string,
    featureId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(roleFeature.roleId, roleId),
          eq(roleFeature.featureId, featureId),
        ),
      );
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.db.delete(this.table).where(eq(roleFeature.roleId, roleId));
  }
}

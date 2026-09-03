import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  companyFeature,
  feature,
  roleFeature,
} from '@repo/database/schema';
import {
  CompanyFeature,
  Feature,
  RoleFeature,
} from '@repo/domains/entities';
import type {
  ICompanyFeatureRepository,
  IFeatureRepository,
  IRoleFeatureRepository,
} from '@repo/domains/repositories/feature';
import type {
  CreateCompanyFeature,
  CreateFeature,
  CreateRoleFeature,
  UpdateCompanyFeature,
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

export class CompanyFeatureRepository
  extends Repository<
    CompanyFeature,
    CreateCompanyFeature,
    UpdateCompanyFeature
  >
  implements ICompanyFeatureRepository
{
  constructor(db: Database) {
    super(db, companyFeature);
  }

  async findByCompanyId(companyId: string): Promise<CompanyFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(companyFeature.companyId, companyId));
    return results.map((r) => new CompanyFeature(r as unknown as CompanyFeature));
  }

  async findActiveByCompanyId(companyId: string): Promise<CompanyFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(companyFeature.companyId, companyId),
          eq(companyFeature.isEnabled, true),
        ),
      );
    return results.map((r) => new CompanyFeature(r as unknown as CompanyFeature));
  }

  async findByCompanyAndFeature(
    companyId: string,
    featureId: string,
  ): Promise<CompanyFeature | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(companyFeature.companyId, companyId),
          eq(companyFeature.featureId, featureId),
        ),
      );
    return result ? new CompanyFeature(result as unknown as CompanyFeature) : null;
  }

  async findByCompanyAndFeatureCode(
    companyId: string,
    featureCode: string,
  ): Promise<CompanyFeature | null> {
    const [result] = await this.db
      .select({
        id: companyFeature.id,
        companyId: companyFeature.companyId,
        featureId: companyFeature.featureId,
        isEnabled: companyFeature.isEnabled,
        assignedBy: companyFeature.assignedBy,
        expiresAt: companyFeature.expiresAt,
        createdAt: companyFeature.createdAt,
        updatedAt: companyFeature.updatedAt,
      })
      .from(companyFeature)
      .innerJoin(feature, eq(companyFeature.featureId, feature.id))
      .where(
        and(
          eq(companyFeature.companyId, companyId),
          eq(feature.code, featureCode),
        ),
      );
    return result ? new CompanyFeature(result as unknown as CompanyFeature) : null;
  }

  async findFeaturesByCompanyId(
    companyId: string,
    onlyEnabled = true,
  ): Promise<Feature[]> {
    const condition = onlyEnabled
      ? and(
          eq(companyFeature.companyId, companyId),
          eq(companyFeature.isEnabled, true),
          eq(feature.isActive, true),
        )
      : eq(companyFeature.companyId, companyId);

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
      .innerJoin(companyFeature, eq(feature.id, companyFeature.featureId))
      .where(condition);

    return results.map((r) => new Feature(r as unknown as Feature));
  }

  async toggleFeature(
    companyId: string,
    featureId: string,
    isEnabled: boolean,
  ): Promise<CompanyFeature> {
    const existing = await this.findByCompanyAndFeature(companyId, featureId);
    if (!existing) {
      return this.create({
        companyId,
        featureId,
        isEnabled,
      });
    }

    const [updated] = await this.db
      .update(this.table)
      .set({ isEnabled, updatedAt: new Date() })
      .where(
        and(
          eq(companyFeature.companyId, companyId),
          eq(companyFeature.featureId, featureId),
        ),
      )
      .returning();

    return new CompanyFeature(updated as unknown as CompanyFeature);
  }

  async deleteByCompanyAndFeature(
    companyId: string,
    featureId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(companyFeature.companyId, companyId),
          eq(companyFeature.featureId, featureId),
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

  async findByCompanyId(companyId: string): Promise<RoleFeature[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleFeature.companyId, companyId));
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
    await this.db
      .delete(this.table)
      .where(eq(roleFeature.roleId, roleId));
  }
}

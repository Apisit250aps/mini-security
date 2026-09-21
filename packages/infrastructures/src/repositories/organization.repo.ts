import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { organization, site, organizationMember } from '@repo/database/schema';
import { Organization, Site, OrganizationMember } from '@repo/domains/entities';
import type {
  ISiteRepository,
  IOrganizationMemberRepository,
  IOrganizationRepository,
} from '@repo/domains/repositories/organization';
import type {
  CreateOrganization,
  CreateSite,
  CreateOrganizationMember,
  UpdateOrganization,
  UpdateSite,
  UpdateOrganizationMember,
} from '@repo/domains/schema/organization';

export class OrganizationRepository
  extends Repository<Organization, CreateOrganization, UpdateOrganization>
  implements IOrganizationRepository
{
  constructor(db: Database) {
    super(db, organization);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(this.whereActive(eq(organization.slug, slug)));
    return result ? new Organization(result as unknown as Organization) : null;
  }

  async findActiveOrganizations(): Promise<Organization[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(this.whereActive(eq(organization.isActive, true)));
    return results.map((r) => new Organization(r as unknown as Organization));
  }
}

export class SiteRepository
  extends Repository<Site, CreateSite, UpdateSite>
  implements ISiteRepository
{
  constructor(db: Database) {
    super(db, site);
  }

  async findByOrganizationId(organizationId: string): Promise<Site[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(this.whereActive(eq(site.organizationId, organizationId)));
    return results.map((r) => new Site(r as unknown as Site));
  }

  async findDefaultByOrganizationId(
    organizationId: string,
  ): Promise<Site | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        this.whereActive(
          eq(site.organizationId, organizationId),
          eq(site.isActive, true),
        ),
      )
      .limit(1);
    return result ? new Site(result as unknown as Site) : null;
  }

  async findByName(organizationId: string, name: string): Promise<Site | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        this.whereActive(
          eq(site.organizationId, organizationId),
          eq(site.name, name),
        ),
      );
    return result ? new Site(result as unknown as Site) : null;
  }
}

export class OrganizationMemberRepository
  extends Repository<
    OrganizationMember,
    CreateOrganizationMember,
    UpdateOrganizationMember
  >
  implements IOrganizationMemberRepository
{
  constructor(db: Database) {
    super(db, organizationMember);
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        this.whereActive(eq(organizationMember.organizationId, organizationId)),
      );
    return results.map(
      (r) => new OrganizationMember(r as unknown as OrganizationMember),
    );
  }

  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(this.whereActive(eq(organizationMember.userId, userId)));
    return results.map(
      (r) => new OrganizationMember(r as unknown as OrganizationMember),
    );
  }

  async findBySiteId(siteId: string): Promise<OrganizationMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(this.whereActive(eq(organizationMember.siteId, siteId)));
    return results.map(
      (r) => new OrganizationMember(r as unknown as OrganizationMember),
    );
  }

  async findByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMember | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        this.whereActive(
          eq(organizationMember.organizationId, organizationId),
          eq(organizationMember.userId, userId),
        ),
      );
    return result
      ? new OrganizationMember(result as unknown as OrganizationMember)
      : null;
  }

  async deleteByOrganizationAndUser(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    await this.softDelete(
      and(
        eq(organizationMember.organizationId, organizationId),
        eq(organizationMember.userId, userId),
      ),
    );
  }
}

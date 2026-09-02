import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { company, companyBranch, companyMember } from '@repo/database/schema';
import { Company, CompanyBranch, CompanyMember } from '@repo/domains/entities';
import type {
  ICompanyBranchRepository,
  ICompanyMemberRepository,
  ICompanyRepository,
} from '@repo/domains/repositories/company';
import type {
  CreateCompany,
  CreateCompanyBranch,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyBranch,
  UpdateCompanyMember,
} from '@repo/domains/schema/company';

export class CompanyRepository
  extends Repository<Company, CreateCompany, UpdateCompany>
  implements ICompanyRepository
{
  constructor(db: Database) {
    super(db, company);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(company.slug, slug));
    return result ? new Company(result as unknown as Company) : null;
  }

  async findActiveCompanies(): Promise<Company[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(company.isActive, true));
    return results.map((r) => new Company(r as unknown as Company));
  }
}

export class CompanyBranchRepository
  extends Repository<CompanyBranch, CreateCompanyBranch, UpdateCompanyBranch>
  implements ICompanyBranchRepository
{
  constructor(db: Database) {
    super(db, companyBranch);
  }

  async findByCompanyId(companyId: string): Promise<CompanyBranch[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(companyBranch.companyId, companyId));
    return results.map((r) => new CompanyBranch(r as unknown as CompanyBranch));
  }

  async findDefaultByCompanyId(
    companyId: string,
  ): Promise<CompanyBranch | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(companyBranch.companyId, companyId),
          eq(companyBranch.isActive, true),
        ),
      )
      .limit(1);
    return result
      ? new CompanyBranch(result as unknown as CompanyBranch)
      : null;
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<CompanyBranch | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(companyBranch.companyId, companyId),
          eq(companyBranch.name, name),
        ),
      );
    return result
      ? new CompanyBranch(result as unknown as CompanyBranch)
      : null;
  }
}

export class CompanyMemberRepository
  extends Repository<CompanyMember, CreateCompanyMember, UpdateCompanyMember>
  implements ICompanyMemberRepository
{
  constructor(db: Database) {
    super(db, companyMember);
  }

  async findByCompanyId(companyId: string): Promise<CompanyMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(companyMember.companyId, companyId));
    return results.map((r) => new CompanyMember(r as unknown as CompanyMember));
  }

  async findByUserId(userId: string): Promise<CompanyMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(companyMember.userId, userId));
    return results.map((r) => new CompanyMember(r as unknown as CompanyMember));
  }

  async findByBranchId(branchId: string): Promise<CompanyMember[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(companyMember.companyBranchId, branchId));
    return results.map((r) => new CompanyMember(r as unknown as CompanyMember));
  }

  async findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(companyMember.companyId, companyId),
          eq(companyMember.userId, userId),
        ),
      );
    return result
      ? new CompanyMember(result as unknown as CompanyMember)
      : null;
  }

  async deleteByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(companyMember.companyId, companyId),
          eq(companyMember.userId, userId),
        ),
      );
  }
}

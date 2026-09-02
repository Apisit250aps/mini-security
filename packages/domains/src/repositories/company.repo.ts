import type { BaseRepository } from '../index';
import type { Company, CompanyBranch, CompanyMember } from '#entities/company';
import type {
  CreateCompany,
  CreateCompanyBranch,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyBranch,
  UpdateCompanyMember,
} from '#schema/company';

export interface ICompanyRepository
  extends BaseRepository<Company, CreateCompany, UpdateCompany> {
  findBySlug(slug: string): Promise<Company | null>;
  findActiveCompanies(): Promise<Company[]>;
}

export interface ICompanyBranchRepository
  extends BaseRepository<
    CompanyBranch,
    CreateCompanyBranch,
    UpdateCompanyBranch
  > {
  findByCompanyId(companyId: string): Promise<CompanyBranch[]>;
  findDefaultByCompanyId(companyId: string): Promise<CompanyBranch | null>;
  findByName(companyId: string, name: string): Promise<CompanyBranch | null>;
}

export interface ICompanyMemberRepository
  extends BaseRepository<
    CompanyMember,
    CreateCompanyMember,
    UpdateCompanyMember
  > {
  findByCompanyId(companyId: string): Promise<CompanyMember[]>;
  findByUserId(userId: string): Promise<CompanyMember[]>;
  findByBranchId(branchId: string): Promise<CompanyMember[]>;
  findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember | null>;
  deleteByCompanyAndUser(companyId: string, userId: string): Promise<void>;
}

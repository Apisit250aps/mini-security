import type { BaseRepository } from '../index';
import type { Company, CompanyMember } from '#entities/company';
import type {
  CreateCompany,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyMember,
} from '#schema/company';

export interface ICompanyRepository
  extends BaseRepository<Company, CreateCompany, UpdateCompany> {
  findBySlug(slug: string): Promise<Company | null>;
  findActiveCompanies(): Promise<Company[]>;
}

export interface ICompanyMemberRepository
  extends BaseRepository<
    CompanyMember,
    CreateCompanyMember,
    UpdateCompanyMember
  > {
  findByCompanyId(companyId: string): Promise<CompanyMember[]>;
  findByUserId(userId: string): Promise<CompanyMember[]>;
  findByCompanyAndUser(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember | null>;
  deleteByCompanyAndUser(companyId: string, userId: string): Promise<void>;
}

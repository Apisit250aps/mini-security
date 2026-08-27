import type { BaseUseCase } from '../index';
import type { Company, CompanyMember } from '#entities/company';
import type {
  CreateCompany,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyMember,
} from '#schema/company';

// Context Types
export type ICreateCompanyContext = { data: CreateCompany; ownerUserId: string };
export type IUpdateCompanyContext = { id: string; data: UpdateCompany };
export type IDeleteCompanyContext = { id: string };
export type IGetCompanyContext = { id: string };
export type IGetCompanyBySlugContext = { slug: string };
export type IGetCompaniesContext = { filter?: Record<string, unknown> };

export type IAddCompanyMemberContext = { data: CreateCompanyMember };
export type IUpdateCompanyMemberContext = {
  id: string;
  data: UpdateCompanyMember;
};
export type IRemoveCompanyMemberContext = { id: string };
export type IGetCompanyMembersContext = { companyId: string };
export type IGetUserCompaniesContext = { userId: string };

// Use Case Contracts
export type ICreateCompanyUseCase = BaseUseCase<ICreateCompanyContext, Company>;
export type IUpdateCompanyUseCase = BaseUseCase<IUpdateCompanyContext, Company>;
export type IDeleteCompanyUseCase = BaseUseCase<IDeleteCompanyContext, void>;
export type IGetCompanyUseCase = BaseUseCase<IGetCompanyContext, Company | null>;
export type IGetCompanyBySlugUseCase = BaseUseCase<
  IGetCompanyBySlugContext,
  Company | null
>;
export type IGetCompaniesUseCase = BaseUseCase<IGetCompaniesContext, Company[]>;

export type IAddCompanyMemberUseCase = BaseUseCase<
  IAddCompanyMemberContext,
  CompanyMember
>;
export type IUpdateCompanyMemberUseCase = BaseUseCase<
  IUpdateCompanyMemberContext,
  CompanyMember
>;
export type IRemoveCompanyMemberUseCase = BaseUseCase<
  IRemoveCompanyMemberContext,
  void
>;
export type IGetCompanyMembersUseCase = BaseUseCase<
  IGetCompanyMembersContext,
  CompanyMember[]
>;
export type IGetUserCompaniesUseCase = BaseUseCase<
  IGetUserCompaniesContext,
  CompanyMember[]
>;

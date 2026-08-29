import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Company, CompanyMember } from '#entities/company';
import type {
  CreateCompany,
  CreateCompanyMember,
  UpdateCompany,
  UpdateCompanyMember,
} from '#schema/company';

// Context Types
export type ICreateCompanyContext = ISecurityContext & {
  data: CreateCompany;
  ownerUserId: string;
};
export type IUpdateCompanyContext = ISecurityContext & {
  id: string;
  data: UpdateCompany;
};
export type IDeleteCompanyContext = ISecurityContext & { id: string };
export type IGetCompanyContext = ISecurityContext & { id: string };
export type IGetCompanyBySlugContext = ISecurityContext & { slug: string };
export type IGetCompaniesContext = ISecurityContext & {
  filter?: Record<string, unknown>;
};

export type IAddCompanyMemberContext = ISecurityContext & {
  data: CreateCompanyMember;
};
export type IUpdateCompanyMemberContext = ISecurityContext & {
  id: string;
  data: UpdateCompanyMember;
};
export type IRemoveCompanyMemberContext = ISecurityContext & { id: string };
export type IGetCompanyMembersContext = ISecurityContext & { companyId: string };
export type IGetUserCompaniesContext = ISecurityContext & { userId: string };

// Use Case Contracts
export type ICreateCompanyUseCase = BaseUseCase<ICreateCompanyContext, Company>;
export type IUpdateCompanyUseCase = BaseUseCase<IUpdateCompanyContext, Company>;
export type IDeleteCompanyUseCase = BaseUseCase<IDeleteCompanyContext, void>;
export type IGetCompanyUseCase = BaseUseCase<
  IGetCompanyContext,
  Company | null
>;
export type IGetCompanyBySlugUseCase = BaseUseCase<
  IGetCompanyBySlugContext,
  Company | null
>;
export type IGetCompaniesUseCase = BaseUseCase<
  IGetCompaniesContext | void,
  Company[]
>;

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

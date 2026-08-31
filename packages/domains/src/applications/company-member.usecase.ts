import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { CompanyMember } from '#entities/company';
import type { CreateCompanyMember, UpdateCompanyMember } from '#schema/company';

// Context Types
export type IAddCompanyMemberContext = ISecurityContext & {
  data: CreateCompanyMember;
};
export type IUpdateCompanyMemberContext = ISecurityContext & {
  id: string;
  data: UpdateCompanyMember;
};
export type IRemoveCompanyMemberContext = ISecurityContext & { id: string };
export type IGetCompanyMembersContext = ISecurityContext & {
  companyId: string;
};
export type IGetUserCompaniesContext = ISecurityContext & { userId: string };

// Use Case Contracts
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

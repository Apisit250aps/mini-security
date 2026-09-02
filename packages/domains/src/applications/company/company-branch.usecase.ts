import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { CompanyBranch } from '#entities/company';
import type { CreateCompanyBranch, UpdateCompanyBranch } from '#schema/company';

// Context Types
export type ICreateCompanyBranchContext = ISecurityContext & {
  data: CreateCompanyBranch;
};
export type IUpdateCompanyBranchContext = ISecurityContext & {
  id: string;
  data: UpdateCompanyBranch;
};
export type IDeleteCompanyBranchContext = ISecurityContext & {
  id: string;
  companyId: string;
};
export type IGetCompanyBranchContext = ISecurityContext & {
  id: string;
};
export type IGetCompanyBranchesContext = ISecurityContext & {
  companyId: string;
};

// Use Case Contracts
export type ICreateCompanyBranchUseCase = BaseUseCase<
  ICreateCompanyBranchContext,
  CompanyBranch
>;
export type IUpdateCompanyBranchUseCase = BaseUseCase<
  IUpdateCompanyBranchContext,
  CompanyBranch
>;
export type IDeleteCompanyBranchUseCase = BaseUseCase<
  IDeleteCompanyBranchContext,
  void
>;
export type IGetCompanyBranchUseCase = BaseUseCase<
  IGetCompanyBranchContext,
  CompanyBranch | null
>;
export type IGetCompanyBranchesUseCase = BaseUseCase<
  IGetCompanyBranchesContext,
  CompanyBranch[]
>;

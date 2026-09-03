import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Company } from '#entities/company';
import type { CreateCompany, UpdateCompany } from '#schema/company';

// Context Types
export type ICreateCompanyContext = ISecurityContext & {
  data: CreateCompany;
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

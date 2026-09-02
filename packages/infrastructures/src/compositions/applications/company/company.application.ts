import {
  CreateCompanyUseCase,
  DeleteCompanyUseCase,
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  GetCompanyUseCase,
  UpdateCompanyUseCase,
} from '@repo/applications';
import {
  companyBranchRepository,
  companyMemberRepository,
  companyRepository,
  roleRepository,
} from '../../repositories';

export const createCompanyUseCase = new CreateCompanyUseCase(
  companyRepository,
  companyBranchRepository,
  companyMemberRepository,
  roleRepository,
);
export const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
export const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
export const getCompanyUseCase = new GetCompanyUseCase(companyRepository);
export const getCompanyBySlugUseCase = new GetCompanyBySlugUseCase(
  companyRepository,
);
export const getCompaniesUseCase = new GetCompaniesUseCase(companyRepository);

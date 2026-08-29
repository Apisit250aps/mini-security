import {
  AddCompanyMemberUseCase,
  CreateCompanyUseCase,
  DeleteCompanyUseCase,
  GetCompaniesUseCase,
  GetCompanyBySlugUseCase,
  GetCompanyMembersUseCase,
  GetCompanyUseCase,
  GetUserCompaniesUseCase,
  RemoveCompanyMemberUseCase,
  UpdateCompanyMemberUseCase,
  UpdateCompanyUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  companyRepository,
} from '../repositories/company.repository';

export const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);
export const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);
export const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepository);
export const getCompanyUseCase = new GetCompanyUseCase(companyRepository);
export const getCompanyBySlugUseCase = new GetCompanyBySlugUseCase(
  companyRepository,
);
export const getCompaniesUseCase = new GetCompaniesUseCase(companyRepository);

export const addCompanyMemberUseCase = new AddCompanyMemberUseCase(
  companyMemberRepository,
  companyRepository,
);
export const updateCompanyMemberUseCase = new UpdateCompanyMemberUseCase(
  companyMemberRepository,
);
export const removeCompanyMemberUseCase = new RemoveCompanyMemberUseCase(
  companyMemberRepository,
);
export const getCompanyMembersUseCase = new GetCompanyMembersUseCase(
  companyMemberRepository,
);
export const getUserCompaniesUseCase = new GetUserCompaniesUseCase(
  companyMemberRepository,
);

import {
  AddCompanyMemberUseCase,
  GetCompanyMembersUseCase,
  GetUserCompaniesUseCase,
  RemoveCompanyMemberUseCase,
  UpdateCompanyMemberUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  companyRepository,
  roleRepository,
} from '../../repositories';

export const addCompanyMemberUseCase = new AddCompanyMemberUseCase(
  companyMemberRepository,
  companyRepository,
  roleRepository,
);
export const updateCompanyMemberUseCase = new UpdateCompanyMemberUseCase(
  companyMemberRepository,
  roleRepository,
);
export const removeCompanyMemberUseCase = new RemoveCompanyMemberUseCase(
  companyMemberRepository,
  roleRepository,
);
export const getCompanyMembersUseCase = new GetCompanyMembersUseCase(
  companyMemberRepository,
);
export const getUserCompaniesUseCase = new GetUserCompaniesUseCase(
  companyMemberRepository,
);

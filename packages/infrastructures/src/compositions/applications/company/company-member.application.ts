import { unitOfWork } from '../../unit-of-work';
import {
  AddCompanyMemberUseCase,
  GetCompanyMembersUseCase,
  GetUserCompaniesUseCase,
  RemoveCompanyMemberUseCase,
  UpdateCompanyMemberUseCase,
} from '@repo/applications';
import {
  companyBranchRepository,
  companyMemberRepository,
  companyRepository,
  roleRepository,
} from '../../repositories';

export const addCompanyMemberUseCase = new AddCompanyMemberUseCase(
  unitOfWork,
  companyMemberRepository,
  companyRepository,
  roleRepository,
  companyBranchRepository,
);
export const updateCompanyMemberUseCase = new UpdateCompanyMemberUseCase(
  companyMemberRepository,
  roleRepository,
  companyBranchRepository,
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

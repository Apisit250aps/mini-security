import {
  CreateCompanyBranchUseCase,
  DeleteCompanyBranchUseCase,
  GetCompanyBranchesUseCase,
  GetCompanyBranchUseCase,
  UpdateCompanyBranchUseCase,
} from '@repo/applications';
import {
  companyBranchRepository,
  companyMemberRepository,
  companyRepository,
} from '../../repositories';

export const createCompanyBranchUseCase = new CreateCompanyBranchUseCase(
  companyBranchRepository,
  companyRepository,
);

export const updateCompanyBranchUseCase = new UpdateCompanyBranchUseCase(
  companyBranchRepository,
);

export const deleteCompanyBranchUseCase = new DeleteCompanyBranchUseCase(
  companyBranchRepository,
  companyMemberRepository,
);

export const getCompanyBranchesUseCase = new GetCompanyBranchesUseCase(
  companyBranchRepository,
);

export const getCompanyBranchUseCase = new GetCompanyBranchUseCase(
  companyBranchRepository,
);

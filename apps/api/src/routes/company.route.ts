import { Hono } from 'hono';
import {
  addCompanyMemberUseCase,
  createCompanyBranchUseCase,
  createCompanyUseCase,
  deleteCompanyBranchUseCase,
  deleteCompanyUseCase,
  getCompaniesUseCase,
  getCompanyBranchesUseCase,
  getCompanyBranchUseCase,
  getCompanyBySlugUseCase,
  getCompanyMembersUseCase,
  getCompanyUseCase,
  getUserCompaniesUseCase,
  removeCompanyMemberUseCase,
  updateCompanyBranchUseCase,
  updateCompanyMemberUseCase,
  updateCompanyUseCase,
} from '@repo/infrastructures/compositions';
import { CompanyController } from '../controllers/company.controller';
import { authMiddleware, type AuthContext } from '../middleware';

const companyController = new CompanyController(
  createCompanyUseCase,
  updateCompanyUseCase,
  deleteCompanyUseCase,
  getCompanyUseCase,
  getCompanyBySlugUseCase,
  getCompaniesUseCase,
  addCompanyMemberUseCase,
  updateCompanyMemberUseCase,
  removeCompanyMemberUseCase,
  getCompanyMembersUseCase,
  getUserCompaniesUseCase,
  createCompanyBranchUseCase,
  updateCompanyBranchUseCase,
  deleteCompanyBranchUseCase,
  getCompanyBranchesUseCase,
  getCompanyBranchUseCase,
);

const companyRoutes = new Hono<AuthContext>();

companyRoutes.use('*', authMiddleware);

// Company CRUD
companyRoutes.get('/', companyController.getCompanies);
companyRoutes.get('/:id', companyController.getCompany);
companyRoutes.get('/slug/:slug', companyController.getCompanyBySlug);
companyRoutes.post('/', companyController.createCompany);
companyRoutes.put('/:id', companyController.updateCompany);
companyRoutes.delete('/:id', companyController.deleteCompany);

// Company Members
companyRoutes.get('/:companyId/members', companyController.getMembers);
companyRoutes.post('/members', companyController.addMember);
companyRoutes.put('/members/:id', companyController.updateMember);
companyRoutes.delete('/members/:id', companyController.removeMember);

// Company Branches
companyRoutes.get('/:companyId/branches', companyController.getBranches);
companyRoutes.post('/branches', companyController.createBranch);
companyRoutes.get('/branches/:id', companyController.getBranch);
companyRoutes.put('/branches/:id', companyController.updateBranch);
companyRoutes.delete('/branches/:id', companyController.deleteBranch);

// Switch Active Company
companyRoutes.post('/:id/switch', companyController.switchActiveCompany);

export default companyRoutes;

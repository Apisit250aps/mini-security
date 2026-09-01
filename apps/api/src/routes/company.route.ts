import { Hono } from 'hono';
import {
  addCompanyMemberUseCase,
  createCompanyUseCase,
  deleteCompanyUseCase,
  getCompaniesUseCase,
  getCompanyBySlugUseCase,
  getCompanyMembersUseCase,
  getCompanyUseCase,
  getUserCompaniesUseCase,
  removeCompanyMemberUseCase,
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

// Switch Active Company
companyRoutes.post('/:id/switch', companyController.switchActiveCompany);

export default companyRoutes;

import { Hono } from 'hono';
import {
  addOrganizationMemberUseCase,
  createSiteUseCase,
  createOrganizationUseCase,
  deleteSiteUseCase,
  deleteOrganizationUseCase,
  getOrganizationsUseCase,
  getSitesUseCase,
  getSiteUseCase,
  getOrganizationBySlugUseCase,
  getOrganizationMembersUseCase,
  getOrganizationUseCase,
  getUserOrganizationsUseCase,
  removeOrganizationMemberUseCase,
  updateSiteUseCase,
  updateOrganizationMemberUseCase,
  updateOrganizationUseCase,
} from '@repo/infrastructures/compositions';
import { OrganizationController } from '../controllers/organization.controller';
import { authMiddleware } from '../middleware';

const organizationController = new OrganizationController(
  createOrganizationUseCase,
  updateOrganizationUseCase,
  deleteOrganizationUseCase,
  getOrganizationUseCase,
  getOrganizationBySlugUseCase,
  getOrganizationsUseCase,
  addOrganizationMemberUseCase,
  updateOrganizationMemberUseCase,
  removeOrganizationMemberUseCase,
  getOrganizationMembersUseCase,
  getUserOrganizationsUseCase,
  createSiteUseCase,
  updateSiteUseCase,
  deleteSiteUseCase,
  getSitesUseCase,
  getSiteUseCase,
);

const organizationRoutes = new Hono();

organizationRoutes.use('*', authMiddleware);

// Organization CRUD
organizationRoutes.get('/', organizationController.getOrganizations);
organizationRoutes.get('/:id', organizationController.getOrganization);
organizationRoutes.get(
  '/slug/:slug',
  organizationController.getOrganizationBySlug,
);
organizationRoutes.post('/', organizationController.createOrganization);
organizationRoutes.put('/:id', organizationController.updateOrganization);
organizationRoutes.delete('/:id', organizationController.deleteOrganization);

// Organization Members
organizationRoutes.get(
  '/:organizationId/members',
  organizationController.getMembers,
);
organizationRoutes.post('/members', organizationController.addMember);
organizationRoutes.put('/members/:id', organizationController.updateMember);
organizationRoutes.delete('/members/:id', organizationController.removeMember);

// Sites
organizationRoutes.get(
  '/:organizationId/sites',
  organizationController.getSites,
);
organizationRoutes.post('/sites', organizationController.createSite);
organizationRoutes.get('/sites/:id', organizationController.getSite);
organizationRoutes.put('/sites/:id', organizationController.updateSite);
organizationRoutes.delete('/sites/:id', organizationController.deleteSite);

// Switch Active Organization
organizationRoutes.post(
  '/:id/switch',
  organizationController.switchActiveOrganization,
);

export default organizationRoutes;

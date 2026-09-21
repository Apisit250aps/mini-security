import { Hono } from 'hono';
import {
  assignOrganizationFeatureUseCase,
  assignRoleFeatureUseCase,
  checkRoleFeatureAccessUseCase,
  createFeatureUseCase,
  getOrganizationAvailableFeaturesUseCase,
  getOrganizationFeaturesUseCase,
  getOrganizationRoleFeaturesUseCase,
  getFeatureByIdUseCase,
  getFeaturesUseCase,
  getRoleFeaturesUseCase,
  removeOrganizationFeatureUseCase,
  revokeRoleFeatureUseCase,
  toggleOrganizationFeatureUseCase,
  toggleFeatureUseCase,
  toggleRoleFeatureUseCase,
  updateFeatureUseCase,
} from '@repo/infrastructures/compositions';
import { FeatureController } from '../controllers/feature.controller';
import { authMiddleware } from '../middleware';

const featureController = new FeatureController(
  createFeatureUseCase,
  updateFeatureUseCase,
  toggleFeatureUseCase,
  getFeaturesUseCase,
  getFeatureByIdUseCase,
  assignOrganizationFeatureUseCase,
  toggleOrganizationFeatureUseCase,
  removeOrganizationFeatureUseCase,
  getOrganizationFeaturesUseCase,
  getOrganizationAvailableFeaturesUseCase,
  assignRoleFeatureUseCase,
  toggleRoleFeatureUseCase,
  revokeRoleFeatureUseCase,
  getRoleFeaturesUseCase,
  getOrganizationRoleFeaturesUseCase,
  checkRoleFeatureAccessUseCase,
);

const featureRoutes = new Hono();

featureRoutes.use('*', authMiddleware);

// Organization Features
featureRoutes.get(
  '/organizations/:organizationId/available',
  featureController.getOrganizationAvailableFeatures,
);
featureRoutes.get(
  '/organizations/:organizationId',
  featureController.getOrganizationFeatures,
);
featureRoutes.post(
  '/organizations/:organizationId/assign',
  featureController.assignOrganizationFeature,
);
featureRoutes.put(
  '/organizations/:organizationId/toggle',
  featureController.toggleOrganizationFeature,
);
featureRoutes.delete(
  '/organizations/:organizationId/features/:featureId',
  featureController.removeOrganizationFeature,
);

// Role Features
featureRoutes.get(
  '/organizations/:organizationId/roles',
  featureController.getOrganizationRoleFeatures,
);
featureRoutes.get('/roles/:roleId', featureController.getRoleFeatures);
featureRoutes.post(
  '/roles/:roleId/assign',
  featureController.assignRoleFeature,
);
featureRoutes.put('/roles/:roleId/toggle', featureController.toggleRoleFeature);
featureRoutes.delete(
  '/roles/:roleId/features/:featureId',
  featureController.revokeRoleFeature,
);
featureRoutes.get(
  '/organizations/:organizationId/roles/:roleId/access/:featureCode',
  featureController.checkRoleFeatureAccess,
);

// Master Features Catalog CRUD
featureRoutes.get('/', featureController.getFeatures);
featureRoutes.get('/:id', featureController.getFeature);
featureRoutes.post('/', featureController.createFeature);
featureRoutes.put('/:id', featureController.updateFeature);
featureRoutes.put('/:id/toggle', featureController.toggleFeature);

export default featureRoutes;

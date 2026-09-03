import { Hono } from 'hono';
import {
  assignCompanyFeatureUseCase,
  assignRoleFeatureUseCase,
  checkRoleFeatureAccessUseCase,
  createFeatureUseCase,
  getCompanyAvailableFeaturesUseCase,
  getCompanyFeaturesUseCase,
  getCompanyRoleFeaturesUseCase,
  getFeatureByIdUseCase,
  getFeaturesUseCase,
  getRoleFeaturesUseCase,
  removeCompanyFeatureUseCase,
  revokeRoleFeatureUseCase,
  toggleCompanyFeatureUseCase,
  toggleFeatureUseCase,
  toggleRoleFeatureUseCase,
  updateFeatureUseCase,
} from '@repo/infrastructures/compositions';
import { FeatureController } from '../controllers/feature.controller';
import { authMiddleware, type AuthContext } from '../middleware';

const featureController = new FeatureController(
  createFeatureUseCase,
  updateFeatureUseCase,
  toggleFeatureUseCase,
  getFeaturesUseCase,
  getFeatureByIdUseCase,
  assignCompanyFeatureUseCase,
  toggleCompanyFeatureUseCase,
  removeCompanyFeatureUseCase,
  getCompanyFeaturesUseCase,
  getCompanyAvailableFeaturesUseCase,
  assignRoleFeatureUseCase,
  toggleRoleFeatureUseCase,
  revokeRoleFeatureUseCase,
  getRoleFeaturesUseCase,
  getCompanyRoleFeaturesUseCase,
  checkRoleFeatureAccessUseCase,
);

const featureRoutes = new Hono<AuthContext>();

featureRoutes.use('*', authMiddleware);

// Company Features
featureRoutes.get(
  '/companies/:companyId/available',
  featureController.getCompanyAvailableFeatures,
);
featureRoutes.get(
  '/companies/:companyId',
  featureController.getCompanyFeatures,
);
featureRoutes.post(
  '/companies/:companyId/assign',
  featureController.assignCompanyFeature,
);
featureRoutes.put(
  '/companies/:companyId/toggle',
  featureController.toggleCompanyFeature,
);
featureRoutes.delete(
  '/companies/:companyId/features/:featureId',
  featureController.removeCompanyFeature,
);

// Role Features
featureRoutes.get(
  '/companies/:companyId/roles',
  featureController.getCompanyRoleFeatures,
);
featureRoutes.get(
  '/roles/:roleId',
  featureController.getRoleFeatures,
);
featureRoutes.post(
  '/roles/:roleId/assign',
  featureController.assignRoleFeature,
);
featureRoutes.put(
  '/roles/:roleId/toggle',
  featureController.toggleRoleFeature,
);
featureRoutes.delete(
  '/roles/:roleId/features/:featureId',
  featureController.revokeRoleFeature,
);
featureRoutes.get(
  '/companies/:companyId/roles/:roleId/access/:featureCode',
  featureController.checkRoleFeatureAccess,
);

// Master Features Catalog CRUD
featureRoutes.get('/', featureController.getFeatures);
featureRoutes.get('/:id', featureController.getFeature);
featureRoutes.post('/', featureController.createFeature);
featureRoutes.put('/:id', featureController.updateFeature);
featureRoutes.put('/:id/toggle', featureController.toggleFeature);

export default featureRoutes;

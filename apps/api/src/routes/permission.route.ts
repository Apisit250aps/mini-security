import { Hono } from 'hono';
import {
  assignPermissionToRoleUseCase,
  createPermissionUseCase,
  createRoleUseCase,
  deletePermissionUseCase,
  deleteRoleUseCase,
  getPermissionsUseCase,
  getRolePermissionsUseCase,
  getRolesByCompanyUseCase,
  getRoleUseCase,
  getSystemDefaultRolesUseCase,
  revokePermissionFromRoleUseCase,
  updatePermissionUseCase,
  updateRoleUseCase,
} from '../applications/permission.application';
import { PermissionController } from '../controllers/permission.controller';

const permissionController = new PermissionController(
  createRoleUseCase,
  updateRoleUseCase,
  deleteRoleUseCase,
  getRoleUseCase,
  getRolesByCompanyUseCase,
  getSystemDefaultRolesUseCase,
  createPermissionUseCase,
  updatePermissionUseCase,
  deletePermissionUseCase,
  getPermissionsUseCase,
  assignPermissionToRoleUseCase,
  revokePermissionFromRoleUseCase,
  getRolePermissionsUseCase,
);

const permissionRoutes = new Hono();

// Roles
permissionRoutes.get(
  '/roles/system-defaults',
  permissionController.getSystemDefaultRoles,
);
permissionRoutes.get(
  '/roles/company/:companyId',
  permissionController.getCompanyRoles,
);
permissionRoutes.get('/roles/:id', permissionController.getRole);
permissionRoutes.post('/roles', permissionController.createRole);
permissionRoutes.put('/roles/:id', permissionController.updateRole);
permissionRoutes.delete('/roles/:id', permissionController.deleteRole);

// Role Permissions
permissionRoutes.get(
  '/roles/:roleId/permissions',
  permissionController.getRolePermissions,
);
permissionRoutes.post(
  '/roles/permissions',
  permissionController.assignPermission,
);
permissionRoutes.delete(
  '/roles/:roleId/permissions/:permissionId',
  permissionController.revokePermission,
);

// Permissions CRUD
permissionRoutes.get('/', permissionController.getPermissions);
permissionRoutes.post('/', permissionController.createPermission);
permissionRoutes.put('/:id', permissionController.updatePermission);
permissionRoutes.delete('/:id', permissionController.deletePermission);

export default permissionRoutes;

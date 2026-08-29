import {
  AssignPermissionToRoleUseCase,
  CheckUserPermissionUseCase,
  CreatePermissionUseCase,
  CreateRoleUseCase,
  DeletePermissionUseCase,
  DeleteRoleUseCase,
  GetPermissionsUseCase,
  GetRolePermissionsUseCase,
  GetRolesByCompanyUseCase,
  GetRoleUseCase,
  GetSystemDefaultRolesUseCase,
  PermissionGuard,
  RevokePermissionFromRoleUseCase,
  UpdatePermissionUseCase,
  UpdateRoleUseCase,
} from '@repo/applications';
import { companyMemberRepository } from '../repositories/company.repository';
import {
  permissionRepository,
  rolePermissionRepository,
  roleRepository,
} from '../repositories/permission.repository';
import { userRepository } from '../repositories/user.repository';

export const createRoleUseCase = new CreateRoleUseCase(roleRepository);
export const updateRoleUseCase = new UpdateRoleUseCase(roleRepository);
export const deleteRoleUseCase = new DeleteRoleUseCase(roleRepository);
export const getRoleUseCase = new GetRoleUseCase(roleRepository);
export const getRolesByCompanyUseCase = new GetRolesByCompanyUseCase(
  roleRepository,
);
export const getSystemDefaultRolesUseCase = new GetSystemDefaultRolesUseCase(
  roleRepository,
);

export const createPermissionUseCase = new CreatePermissionUseCase(
  permissionRepository,
);
export const updatePermissionUseCase = new UpdatePermissionUseCase(
  permissionRepository,
);
export const deletePermissionUseCase = new DeletePermissionUseCase(
  permissionRepository,
);
export const getPermissionsUseCase = new GetPermissionsUseCase(
  permissionRepository,
);

export const assignPermissionToRoleUseCase = new AssignPermissionToRoleUseCase(
  rolePermissionRepository,
  roleRepository,
  permissionRepository,
);
export const revokePermissionFromRoleUseCase =
  new RevokePermissionFromRoleUseCase(rolePermissionRepository);
export const getRolePermissionsUseCase = new GetRolePermissionsUseCase(
  rolePermissionRepository,
);
export const checkUserPermissionUseCase = new CheckUserPermissionUseCase(
  rolePermissionRepository,
  permissionRepository,
  userRepository,
  companyMemberRepository,
);

// Register checker in PermissionGuard for @RequirePermission decorator support
PermissionGuard.setChecker(checkUserPermissionUseCase);

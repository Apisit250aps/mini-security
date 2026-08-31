import {
  AssignPermissionToRoleUseCase,
  CheckUserPermissionUseCase,
  CreatePermissionUseCase,
  CreateRoleUseCase,
  DeletePermissionUseCase,
  DeleteRoleUseCase,
  GetMyPermissionsUseCase,
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
import {
  companyMemberRepository,
  permissionRepository,
  rolePermissionRepository,
  roleRepository,
  userRepository,
} from '../repositories';

export const createRoleUseCase = new CreateRoleUseCase(
  roleRepository,
  userRepository,
);
export const updateRoleUseCase = new UpdateRoleUseCase(
  roleRepository,
  userRepository,
);
export const deleteRoleUseCase = new DeleteRoleUseCase(
  roleRepository,
  userRepository,
);
export const getRoleUseCase = new GetRoleUseCase(roleRepository);
export const getRolesByCompanyUseCase = new GetRolesByCompanyUseCase(
  roleRepository,
  userRepository,
);
export const getSystemDefaultRolesUseCase = new GetSystemDefaultRolesUseCase(
  roleRepository,
  userRepository,
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
  userRepository,
);
export const revokePermissionFromRoleUseCase =
  new RevokePermissionFromRoleUseCase(
    rolePermissionRepository,
    roleRepository,
    userRepository,
  );
export const getRolePermissionsUseCase = new GetRolePermissionsUseCase(
  rolePermissionRepository,
);
export const getMyPermissionsUseCase = new GetMyPermissionsUseCase(
  userRepository,
  companyMemberRepository,
  rolePermissionRepository,
  permissionRepository,
);
export const checkUserPermissionUseCase = new CheckUserPermissionUseCase(
  rolePermissionRepository,
  permissionRepository,
  userRepository,
  companyMemberRepository,
);

// Register checker in PermissionGuard for @RequirePermission decorator support
PermissionGuard.setChecker(checkUserPermissionUseCase);

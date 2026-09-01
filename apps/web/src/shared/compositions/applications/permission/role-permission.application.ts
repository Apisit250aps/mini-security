import {
  AssignPermissionToRoleUseCase,
  CheckUserPermissionUseCase,
  GetMyPermissionsUseCase,
  GetRolePermissionsUseCase,
  PermissionGuard,
  RevokePermissionFromRoleUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  permissionRepository,
  rolePermissionRepository,
  roleRepository,
  userRepository,
} from '../../repositories';

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

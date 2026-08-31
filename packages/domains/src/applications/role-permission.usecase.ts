import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Permission, RolePermission } from '#entities/permission';
import type { CreateRolePermission } from '#schema/permission';

// Context Types
export type IAssignPermissionToRoleContext = ISecurityContext & {
  data: CreateRolePermission;
};
export type IRevokePermissionFromRoleContext = ISecurityContext & {
  roleId: string;
  permissionId: string;
};
export type IGetRolePermissionsContext = ISecurityContext & { roleId: string };
export type ICheckUserPermissionContext = {
  userId: string;
  companyId?: string;
  action: string;
};
export type IGetMyPermissionsContext = ISecurityContext & {
  companyId?: string;
};

// Use Case Contracts
export type IAssignPermissionToRoleUseCase = BaseUseCase<
  IAssignPermissionToRoleContext,
  RolePermission
>;
export type IRevokePermissionFromRoleUseCase = BaseUseCase<
  IRevokePermissionFromRoleContext,
  void
>;
export type IGetRolePermissionsUseCase = BaseUseCase<
  IGetRolePermissionsContext,
  Permission[]
>;
export type ICheckUserPermissionUseCase = BaseUseCase<
  ICheckUserPermissionContext,
  boolean
>;
export type IGetMyPermissionsUseCase = BaseUseCase<
  IGetMyPermissionsContext,
  Permission[]
>;

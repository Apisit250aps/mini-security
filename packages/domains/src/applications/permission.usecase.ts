import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Permission, Role, RolePermission } from '#entities/permission';
import type {
  CreatePermission,
  CreateRole,
  CreateRolePermission,
  UpdatePermission,
  UpdateRole,
} from '#schema/permission';

// Context Types
export type ICreateRoleContext = ISecurityContext & { data: CreateRole };
export type IUpdateRoleContext = ISecurityContext & {
  id: string;
  data: UpdateRole;
};
export type IDeleteRoleContext = ISecurityContext & { id: string };
export type IGetRoleContext = ISecurityContext & { id: string };
export type IGetRolesByCompanyContext = ISecurityContext & {
  companyId: string;
};
export type IGetSystemDefaultRolesContext = ISecurityContext | void;

export type ICreatePermissionContext = ISecurityContext & {
  data: CreatePermission;
};
export type IUpdatePermissionContext = ISecurityContext & {
  id: string;
  data: UpdatePermission;
};
export type IDeletePermissionContext = ISecurityContext & { id: string };
export type IGetPermissionsContext = ISecurityContext & { module?: string };

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
export type ICreateRoleUseCase = BaseUseCase<ICreateRoleContext, Role>;
export type IUpdateRoleUseCase = BaseUseCase<IUpdateRoleContext, Role>;
export type IDeleteRoleUseCase = BaseUseCase<IDeleteRoleContext, void>;
export type IGetRoleUseCase = BaseUseCase<IGetRoleContext, Role | null>;
export type IGetRolesByCompanyUseCase = BaseUseCase<
  IGetRolesByCompanyContext,
  Role[]
>;
export type IGetSystemDefaultRolesUseCase = BaseUseCase<
  IGetSystemDefaultRolesContext | void,
  Role[]
>;

export type ICreatePermissionUseCase = BaseUseCase<
  ICreatePermissionContext,
  Permission
>;
export type IUpdatePermissionUseCase = BaseUseCase<
  IUpdatePermissionContext,
  Permission
>;
export type IDeletePermissionUseCase = BaseUseCase<
  IDeletePermissionContext,
  void
>;
export type IGetPermissionsUseCase = BaseUseCase<
  IGetPermissionsContext | void,
  Permission[]
>;

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

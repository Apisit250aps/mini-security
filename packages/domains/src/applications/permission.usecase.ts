import type { BaseUseCase } from '../index';
import type { Permission, Role, RolePermission } from '#entities/permission';
import type {
  CreatePermission,
  CreateRole,
  CreateRolePermission,
  UpdatePermission,
  UpdateRole,
} from '#schema/permission';

// Context Types
export type ICreateRoleContext = { data: CreateRole };
export type IUpdateRoleContext = { id: string; data: UpdateRole };
export type IDeleteRoleContext = { id: string };
export type IGetRoleContext = { id: string };
export type IGetRolesByCompanyContext = { companyId: string };
export type IGetSystemDefaultRolesContext = void;

export type ICreatePermissionContext = { data: CreatePermission };
export type IUpdatePermissionContext = { id: string; data: UpdatePermission };
export type IDeletePermissionContext = { id: string };
export type IGetPermissionsContext = { module?: string };

export type IAssignPermissionToRoleContext = { data: CreateRolePermission };
export type IRevokePermissionFromRoleContext = {
  roleId: string;
  permissionId: string;
};
export type IGetRolePermissionsContext = { roleId: string };
export type ICheckUserPermissionContext = {
  userId: string;
  companyId?: string;
  action: string;
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
  IGetSystemDefaultRolesContext,
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
  IGetPermissionsContext,
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

import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Permission } from '#entities/permission';
import type { CreatePermission, UpdatePermission } from '#schema/permission';

// Context Types
export type ICreatePermissionContext = ISecurityContext & {
  data: CreatePermission;
};
export type IUpdatePermissionContext = ISecurityContext & {
  id: string;
  data: UpdatePermission;
};
export type IDeletePermissionContext = ISecurityContext & { id: string };
export type IGetPermissionsContext = ISecurityContext & { module?: string };

// Use Case Contracts
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

// Re-exports for backward compatibility
export * from './role.usecase';
export * from './role-permission.usecase';

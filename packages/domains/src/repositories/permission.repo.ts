import type { BaseRepository } from '../index';
import type { Permission, Role, RolePermission } from '#entities/permission';
import type {
  CreatePermission,
  CreateRole,
  CreateRolePermission,
  UpdatePermission,
  UpdateRole,
  UpdateRolePermission,
} from '#schema/permission';

export interface IRoleRepository
  extends BaseRepository<Role, CreateRole, UpdateRole> {
  findByCompanyId(
    companyId: string,
    includeSuperAdmin?: boolean,
  ): Promise<Role[]>;
  findSystemDefaultRoles(includeSuperAdmin?: boolean): Promise<Role[]>;
  findByNameAndCompany(
    name: string,
    companyId?: string | null,
  ): Promise<Role | null>;
}

export interface IPermissionRepository
  extends BaseRepository<Permission, CreatePermission, UpdatePermission> {
  findByAction(action: string): Promise<Permission | null>;
  findByModule(module: string): Promise<Permission[]>;
  findByFeatureId(featureId: string): Promise<Permission[]>;
}

export interface IRolePermissionRepository
  extends BaseRepository<
    RolePermission,
    CreateRolePermission,
    UpdateRolePermission
  > {
  findByRoleId(roleId: string): Promise<RolePermission[]>;
  findPermissionsByRoleId(roleId: string): Promise<Permission[]>;
  findPermissionsByRoleIds(roleIds: string[]): Promise<Permission[]>;
  deleteByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void>;
  deleteByRoleId(roleId: string): Promise<void>;
}

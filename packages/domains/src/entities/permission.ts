import type {
  PermissionEntity,
  RoleEntity,
  RolePermissionEntity,
  RoleType,
} from '#schema/permission';

export class Role implements RoleEntity {
  id: string;
  companyId?: string | null;
  name: string;
  description?: string | null;
  roleType: RoleType;
  isSystemDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RoleEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.description = data.description;
    this.roleType = data.roleType;
    this.isSystemDefault = data.isSystemDefault;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Permission implements PermissionEntity {
  id: string;
  action: string;
  module: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PermissionEntity) {
    this.id = data.id;
    this.action = data.action;
    this.module = data.module;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class RolePermission implements RolePermissionEntity {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: RolePermissionEntity) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.permissionId = data.permissionId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

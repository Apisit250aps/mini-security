import db from '@repo/database/db';
import {
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
} from '@repo/infrastructures';

export const roleRepository = new RoleRepository(db);
export const permissionRepository = new PermissionRepository(db);
export const rolePermissionRepository = new RolePermissionRepository(db);

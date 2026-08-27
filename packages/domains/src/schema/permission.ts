import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  StringField,
  UUIDField,
} from '#lib/entity';

// --- Role Schema ---
export const roleSchema = BaseEntity({
  companyId: UUIDField({ required: false, nullable: true }),
  name: StringField({ required: true }),
  description: StringField({ required: false, nullable: true }),
  isSystemDefault: BooleanField({ default: () => false }),
});

export const createRoleSchema = roleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleSchema = roleSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type RoleEntity = z.infer<typeof roleSchema>;
export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;

// --- Permission Schema (Action-based / Resource-based) ---
export const permissionSchema = BaseEntity({
  action: StringField({ required: true }),
  module: StringField({ required: true }),
  description: StringField({ required: false, nullable: true }),
});

export const createPermissionSchema = permissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePermissionSchema = permissionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type PermissionEntity = z.infer<typeof permissionSchema>;
export type CreatePermission = z.infer<typeof createPermissionSchema>;
export type UpdatePermission = z.infer<typeof updatePermissionSchema>;

// --- Role Permission Mapping Schema ---
export const rolePermissionSchema = BaseEntity({
  roleId: UUIDField({ required: true }),
  permissionId: UUIDField({ required: true }),
});

export const createRolePermissionSchema = rolePermissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRolePermissionSchema = rolePermissionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type RolePermissionEntity = z.infer<typeof rolePermissionSchema>;
export type CreateRolePermission = z.infer<typeof createRolePermissionSchema>;
export type UpdateRolePermission = z.infer<typeof updateRolePermissionSchema>;

namespace MiniSecurity;

// ─── Role ─────────────────────────────────────────────────────────────────────
model Role is Domain.Entity.Role;

model CreateRole
  is OmitProperties<Role, "id" | "createdAt" | "updatedAt">;

model UpdateRole
  is OptionalProperties<OmitProperties<Role, "id" | "createdAt" | "updatedAt">>;

// ─── Permission ───────────────────────────────────────────────────────────────
model Permission is Domain.Entity.Permission;

model CreatePermission
  is OmitProperties<Permission, "id" | "createdAt" | "updatedAt">;

model UpdatePermission
  is OptionalProperties<OmitProperties<Permission, "id" | "createdAt" | "updatedAt">>;

// ─── RolePermission ───────────────────────────────────────────────────────────
model RolePermission is Domain.Entity.RolePermission;

model CreateRolePermission
  is OmitProperties<RolePermission, "id" | "createdAt" | "updatedAt">;

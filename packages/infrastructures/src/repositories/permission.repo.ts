import { and, eq, inArray, isNull, ne, or } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { permission, role, rolePermission } from '@repo/database/schema';
import { Permission, Role, RolePermission } from '@repo/domains/entities';
import type {
  IPermissionRepository,
  IRolePermissionRepository,
  IRoleRepository,
} from '@repo/domains/repositories/permission';
import type {
  CreatePermission,
  CreateRole,
  CreateRolePermission,
  UpdatePermission,
  UpdateRole,
  UpdateRolePermission,
} from '@repo/domains/schema/permission';

export class RoleRepository
  extends Repository<Role, CreateRole, UpdateRole>
  implements IRoleRepository
{
  constructor(db: Database) {
    super(db, role);
  }

  async findByCompanyId(companyId: string): Promise<Role[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        or(
          eq(role.companyId, companyId),
          and(eq(role.isSystemDefault, true), ne(role.name, 'Super Admin')),
        ),
      );
    return results.map((r) => new Role(r as unknown as Role));
  }

  async findSystemDefaultRoles(): Promise<Role[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(role.isSystemDefault, true));
    return results.map((r) => new Role(r as unknown as Role));
  }

  async findByNameAndCompany(
    name: string,
    companyId?: string | null,
  ): Promise<Role | null> {
    const condition = companyId
      ? and(eq(role.name, name), eq(role.companyId, companyId))
      : and(eq(role.name, name), isNull(role.companyId));

    const [result] = await this.db.select().from(this.table).where(condition);
    return result ? new Role(result as unknown as Role) : null;
  }
}

export class PermissionRepository
  extends Repository<Permission, CreatePermission, UpdatePermission>
  implements IPermissionRepository
{
  constructor(db: Database) {
    super(db, permission);
  }

  async findByAction(action: string): Promise<Permission | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(permission.action, action));
    return result ? new Permission(result as unknown as Permission) : null;
  }

  async findByModule(module: string): Promise<Permission[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(permission.module, module));
    return results.map((r) => new Permission(r as unknown as Permission));
  }
}

export class RolePermissionRepository
  extends Repository<RolePermission, CreateRolePermission, UpdateRolePermission>
  implements IRolePermissionRepository
{
  constructor(db: Database) {
    super(db, rolePermission);
  }

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(rolePermission.roleId, roleId));
    return results.map(
      (r) => new RolePermission(r as unknown as RolePermission),
    );
  }

  async findPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const results = await this.db
      .select({
        id: permission.id,
        action: permission.action,
        module: permission.module,
        description: permission.description,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(rolePermission.roleId, roleId));

    return results.map((r) => new Permission(r as unknown as Permission));
  }

  async findPermissionsByRoleIds(roleIds: string[]): Promise<Permission[]> {
    if (roleIds.length === 0) return [];

    const results = await this.db
      .select({
        id: permission.id,
        action: permission.action,
        module: permission.module,
        description: permission.description,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
      })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(inArray(rolePermission.roleId, roleIds));

    return results.map((r) => new Permission(r as unknown as Permission));
  }

  async deleteByRoleAndPermission(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(rolePermission.roleId, roleId),
          eq(rolePermission.permissionId, permissionId),
        ),
      );
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.db.delete(this.table).where(eq(rolePermission.roleId, roleId));
  }
}

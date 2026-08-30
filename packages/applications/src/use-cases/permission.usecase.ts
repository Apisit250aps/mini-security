import type {
  IAssignPermissionToRoleContext,
  IAssignPermissionToRoleUseCase,
  ICheckUserPermissionContext,
  ICheckUserPermissionUseCase,
  ICreatePermissionContext,
  ICreatePermissionUseCase,
  ICreateRoleContext,
  ICreateRoleUseCase,
  IDeletePermissionContext,
  IDeletePermissionUseCase,
  IDeleteRoleContext,
  IDeleteRoleUseCase,
  IGetPermissionsContext,
  IGetPermissionsUseCase,
  IGetRoleContext,
  IGetRolePermissionsContext,
  IGetRolePermissionsUseCase,
  IGetRoleUseCase,
  IGetRolesByCompanyContext,
  IGetRolesByCompanyUseCase,
  IGetSystemDefaultRolesContext,
  IGetSystemDefaultRolesUseCase,
  IRevokePermissionFromRoleContext,
  IRevokePermissionFromRoleUseCase,
  IUpdatePermissionContext,
  IUpdatePermissionUseCase,
  IUpdateRoleContext,
  IUpdateRoleUseCase,
} from '@repo/domains/applications/permission';
import type {
  Permission,
  Role,
  RolePermission,
} from '@repo/domains/entities/permission';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IPermissionRepository,
  IRolePermissionRepository,
  IRoleRepository,
} from '@repo/domains/repositories/permission';
import type { IUserRepository } from '@repo/domains/repositories/user';
import {
  createPermissionSchema,
  createRolePermissionSchema,
  createRoleSchema,
  updatePermissionSchema,
  updateRoleSchema,
} from '@repo/domains/schema/permission';
import { RequirePermission } from '../decorators/permission.decorator';
import { DuplicateError, NotFoundError, ValidationError } from '../lib/error';

export class CreateRoleUseCase implements ICreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:create', (ctx) => ({
    companyId: ctx.data.companyId ?? undefined,
  }))
  async execute(context: ICreateRoleContext): Promise<Role> {
    const parsed = await createRoleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid role data', parsed.error.format());
    }

    const existing = await this.roleRepository.findByNameAndCompany(
      parsed.data.name,
      parsed.data.companyId,
    );
    if (existing) {
      throw new DuplicateError(
        'Role with this name already exists in this scope',
      );
    }

    return this.roleRepository.create(parsed.data);
  }
}

export class UpdateRoleUseCase implements IUpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:update')
  async execute(context: IUpdateRoleContext): Promise<Role> {
    const existing = await this.roleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Role with id ${context.id} not found`);
    }

    const parsed = await updateRoleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update role data',
        parsed.error.format(),
      );
    }

    return this.roleRepository.update(context.id, parsed.data);
  }
}

export class DeleteRoleUseCase implements IDeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:delete')
  async execute(context: IDeleteRoleContext): Promise<void> {
    const existing = await this.roleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Role with id ${context.id} not found`);
    }

    await this.roleRepository.delete(context.id);
  }
}

export class GetRoleUseCase implements IGetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:read')
  async execute(context: IGetRoleContext): Promise<Role | null> {
    const role = await this.roleRepository.findById(context.id);
    if (!role) {
      throw new NotFoundError(`Role with id ${context.id} not found`);
    }
    return role;
  }
}

export class GetRolesByCompanyUseCase implements IGetRolesByCompanyUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:read', (ctx) => ({
    companyId: ctx.companyId,
  }))
  async execute(context: IGetRolesByCompanyContext): Promise<Role[]> {
    return this.roleRepository.findByCompanyId(context.companyId);
  }
}

export class GetSystemDefaultRolesUseCase
  implements IGetSystemDefaultRolesUseCase
{
  constructor(private readonly roleRepository: IRoleRepository) {}

  @RequirePermission('role:read')
  async execute(_context?: IGetSystemDefaultRolesContext): Promise<Role[]> {
    return this.roleRepository.findSystemDefaultRoles();
  }
}

export class CreatePermissionUseCase implements ICreatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:create')
  async execute(context: ICreatePermissionContext): Promise<Permission> {
    const parsed = await createPermissionSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid permission data',
        parsed.error.format(),
      );
    }

    const existing = await this.permissionRepository.findByAction(
      parsed.data.action,
    );
    if (existing) {
      throw new DuplicateError('Permission with this action already exists');
    }

    return this.permissionRepository.create(parsed.data);
  }
}

export class UpdatePermissionUseCase implements IUpdatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:update')
  async execute(context: IUpdatePermissionContext): Promise<Permission> {
    const existing = await this.permissionRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Permission with id ${context.id} not found`);
    }

    const parsed = await updatePermissionSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update permission data',
        parsed.error.format(),
      );
    }

    return this.permissionRepository.update(context.id, parsed.data);
  }
}

export class DeletePermissionUseCase implements IDeletePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:delete')
  async execute(context: IDeletePermissionContext): Promise<void> {
    const existing = await this.permissionRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Permission with id ${context.id} not found`);
    }

    await this.permissionRepository.delete(context.id);
  }
}

export class GetPermissionsUseCase implements IGetPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:read')
  async execute(context?: IGetPermissionsContext): Promise<Permission[]> {
    if (context?.module) {
      return this.permissionRepository.findByModule(context.module);
    }
    return this.permissionRepository.findAll();
  }
}

export class AssignPermissionToRoleUseCase
  implements IAssignPermissionToRoleUseCase
{
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  @RequirePermission('permission:assign')
  async execute(
    context: IAssignPermissionToRoleContext,
  ): Promise<RolePermission> {
    const parsed = await createRolePermissionSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid role permission data',
        parsed.error.format(),
      );
    }

    const role = await this.roleRepository.findById(parsed.data.roleId);
    if (!role) {
      throw new NotFoundError(`Role with id ${parsed.data.roleId} not found`);
    }

    const perm = await this.permissionRepository.findById(
      parsed.data.permissionId,
    );
    if (!perm) {
      throw new NotFoundError(
        `Permission with id ${parsed.data.permissionId} not found`,
      );
    }

    return this.rolePermissionRepository.create(parsed.data);
  }
}

export class RevokePermissionFromRoleUseCase
  implements IRevokePermissionFromRoleUseCase
{
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  @RequirePermission('permission:revoke')
  async execute(context: IRevokePermissionFromRoleContext): Promise<void> {
    await this.rolePermissionRepository.deleteByRoleAndPermission(
      context.roleId,
      context.permissionId,
    );
  }
}

export class GetRolePermissionsUseCase implements IGetRolePermissionsUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
  ) {}

  @RequirePermission('permission:read')
  async execute(context: IGetRolePermissionsContext): Promise<Permission[]> {
    return this.rolePermissionRepository.findPermissionsByRoleId(
      context.roleId,
    );
  }
}

export class CheckUserPermissionUseCase implements ICheckUserPermissionUseCase {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly userRepository: IUserRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  async execute(context: ICheckUserPermissionContext): Promise<boolean> {
    if (!context.userId || !context.action) return false;

    // 1. Verify user exists and is currently active
    const user = await this.userRepository.findById(context.userId);
    if (!user || !user.isActive) return false;

    // 2. Super admin bypasses all authorization checks
    if (user.isAdmin) return true;

    // 3. When scoped to a specific company, check company membership and role permissions
    if (context.companyId) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        context.companyId,
        context.userId,
      );
      if (!member || !member.isActive) return false;

      const permissions =
        await this.rolePermissionRepository.findPermissionsByRoleId(
          member.roleId,
        );

      return permissions.some(
        (p) =>
          p.action === context.action ||
          p.action === '*' ||
          p.action === `${context.action.split(':')[0]}:*`,
      );
    }

    // 4. When unscoped (global / system operations), check user active memberships' roles
    const userMemberships = await this.companyMemberRepository.findByUserId(
      context.userId,
    );
    const activeMemberships = userMemberships.filter((m) => m.isActive);
    if (activeMemberships.length === 0) return false;

    const roleIds = [...new Set(activeMemberships.map((m) => m.roleId))];
    const permissions =
      await this.rolePermissionRepository.findPermissionsByRoleIds(roleIds);

    return permissions.some(
      (p) =>
        p.action === context.action ||
        p.action === '*' ||
        p.action === `${context.action.split(':')[0]}:*`,
    );
  }
}

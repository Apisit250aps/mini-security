import type {
  IAssignPermissionToRoleContext,
  IAssignPermissionToRoleUseCase,
  ICheckUserPermissionContext,
  ICheckUserPermissionUseCase,
  IGetMyPermissionsContext,
  IGetMyPermissionsUseCase,
  IGetRolePermissionsContext,
  IGetRolePermissionsUseCase,
  IRevokePermissionFromRoleContext,
  IRevokePermissionFromRoleUseCase,
} from '@repo/domains/applications/permission';
import type {
  Permission,
  RolePermission,
} from '@repo/domains/entities/permission';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  IPermissionRepository,
  IRolePermissionRepository,
  IRoleRepository,
} from '@repo/domains/repositories/permission';
import type { IUserRepository } from '@repo/domains/repositories/user';
import { createRolePermissionSchema } from '@repo/domains/schema/permission';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class AssignPermissionToRoleUseCase
  implements IAssignPermissionToRoleUseCase
{
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
    private readonly userRepository?: IUserRepository,
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

    let isAdmin = false;
    if (context.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }

    if (role.isSystemDefault && !isAdmin) {
      throw new ValidationError(
        'ไม่สามารถแก้ไขสิทธิ์ของบทบาทมาตรฐานของระบบ (System Default) ได้',
      );
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
    private readonly roleRepository?: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  @RequirePermission('permission:revoke')
  async execute(context: IRevokePermissionFromRoleContext): Promise<void> {
    if (this.roleRepository) {
      const role = await this.roleRepository.findById(context.roleId);
      if (role) {
        let isAdmin = false;
        if (context.userId && this.userRepository) {
          const user = await this.userRepository.findById(context.userId);
          isAdmin = Boolean(user?.isAdmin);
        }
        if (role.isSystemDefault && !isAdmin) {
          throw new ValidationError(
            'ไม่สามารถแก้ไขสิทธิ์ของบทบาทมาตรฐานของระบบ (System Default) ได้',
          );
        }
      }
    }

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

export class GetMyPermissionsUseCase implements IGetMyPermissionsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(context: IGetMyPermissionsContext): Promise<Permission[]> {
    if (!context.userId) return [];

    const user = await this.userRepository.findById(context.userId);
    if (!user || !user.isActive) return [];

    // 1. Super admin has full access to all system permissions
    if (user.isAdmin) {
      return this.permissionRepository.findAll();
    }

    // 2. When scoped to a specific company
    if (context.companyId) {
      const member = await this.companyMemberRepository.findByCompanyAndUser(
        context.companyId,
        context.userId,
      );
      if (!member || !member.isActive) return [];

      return this.rolePermissionRepository.findPermissionsByRoleId(
        member.roleId,
      );
    }

    // 3. Unscoped: aggregate permissions across all active company memberships
    const userMemberships = await this.companyMemberRepository.findByUserId(
      context.userId,
    );
    const activeMemberships = userMemberships.filter((m) => m.isActive);
    if (activeMemberships.length === 0) return [];

    const roleIds = [...new Set(activeMemberships.map((m) => m.roleId))];
    return this.rolePermissionRepository.findPermissionsByRoleIds(roleIds);
  }
}

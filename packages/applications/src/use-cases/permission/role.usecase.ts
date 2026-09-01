import type {
  ICreateRoleContext,
  ICreateRoleUseCase,
  IDeleteRoleContext,
  IDeleteRoleUseCase,
  IGetRoleContext,
  IGetRolesByCompanyContext,
  IGetRolesByCompanyUseCase,
  IGetRoleUseCase,
  IGetSystemDefaultRolesContext,
  IGetSystemDefaultRolesUseCase,
  IUpdateRoleContext,
  IUpdateRoleUseCase,
} from '@repo/domains/applications/permission';
import type { Role } from '@repo/domains/entities/permission';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import type { IUserRepository } from '@repo/domains/repositories/user';
import {
  createRoleSchema,
  updateRoleSchema,
} from '@repo/domains/schema/permission';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateRoleUseCase implements ICreateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  async execute(context: ICreateRoleContext): Promise<Role> {
    const parsed = await createRoleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid role data', parsed.error.format());
    }

    let isAdmin = false;
    if (context.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }

    if (!isAdmin && parsed.data.roleType === 'SUPER_ADMIN') {
      throw new ValidationError('ไม่อนุญาตให้สร้างบทบาทประเภท Super Admin');
    }

    if (parsed.data.companyId && parsed.data.roleType === 'SUPER_ADMIN') {
      throw new ValidationError(
        'บทบาทเฉพาะบริษัทไม่สามารถเป็นประเภท Super Admin ได้',
      );
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

    const roleData = {
      ...parsed.data,
      isSystemDefault:
        isAdmin && !parsed.data.companyId
          ? (parsed.data.isSystemDefault ?? false)
          : false,
    };

    return this.roleRepository.create(roleData);
  }
}

export class UpdateRoleUseCase implements IUpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  @RequirePermission('role:update')
  async execute(context: IUpdateRoleContext): Promise<Role> {
    const existing = await this.roleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Role with id ${context.id} not found`);
    }

    let isAdmin = false;
    if (context.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }

    if (existing.isSystemDefault && !isAdmin) {
      throw new ValidationError(
        'ไม่สามารถแก้ไขบทบาทมาตรฐานของระบบ (System Default) ได้',
      );
    }

    const parsed = await updateRoleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update role data',
        parsed.error.format(),
      );
    }

    if (!isAdmin && parsed.data.roleType === 'SUPER_ADMIN') {
      throw new ValidationError('ไม่อนุญาตให้กำหนดบทบาทเป็นประเภท Super Admin');
    }

    if (
      (existing.companyId || parsed.data.companyId) &&
      parsed.data.roleType === 'SUPER_ADMIN'
    ) {
      throw new ValidationError(
        'บทบาทเฉพาะบริษัทไม่สามารถเป็นประเภท Super Admin ได้',
      );
    }

    return this.roleRepository.update(context.id, parsed.data);
  }
}

export class DeleteRoleUseCase implements IDeleteRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  @RequirePermission('role:delete')
  async execute(context: IDeleteRoleContext): Promise<void> {
    const existing = await this.roleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Role with id ${context.id} not found`);
    }

    let isAdmin = false;
    if (context.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }

    if (existing.isSystemDefault && !isAdmin) {
      throw new ValidationError(
        'ไม่สามารถลบบทบาทมาตรฐานของระบบ (System Default) ได้',
      );
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
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  @RequirePermission('role:read', (ctx) => ({
    companyId: ctx.companyId,
  }))
  async execute(context: IGetRolesByCompanyContext): Promise<Role[]> {
    let isAdmin = false;
    if (context.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }
    return this.roleRepository.findByCompanyId(context.companyId, isAdmin);
  }
}

export class GetSystemDefaultRolesUseCase
  implements IGetSystemDefaultRolesUseCase
{
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository?: IUserRepository,
  ) {}

  @RequirePermission('role:read')
  async execute(context?: IGetSystemDefaultRolesContext): Promise<Role[]> {
    let isAdmin = false;
    if (context?.userId && this.userRepository) {
      const user = await this.userRepository.findById(context.userId);
      isAdmin = Boolean(user?.isAdmin);
    }
    return this.roleRepository.findSystemDefaultRoles(isAdmin);
  }
}

import type {
  ICreatePermissionContext,
  ICreatePermissionUseCase,
  IDeletePermissionContext,
  IDeletePermissionUseCase,
  IGetPermissionsContext,
  IGetPermissionsUseCase,
  IUpdatePermissionContext,
  IUpdatePermissionUseCase,
} from '@repo/domains/applications/permission';
import type { Permission } from '@repo/domains/entities/permission';
import type { IPermissionRepository } from '@repo/domains/repositories/permission';
import {
  createPermissionSchema,
  updatePermissionSchema,
} from '@repo/domains/schema/permission';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

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

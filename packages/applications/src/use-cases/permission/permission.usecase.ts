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
import { DuplicateError } from '../../lib/error';
import { requireEntityExists } from '../../lib/guards';
import { parseSchemaOrThrow } from '../../lib/validation';

export class CreatePermissionUseCase implements ICreatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:create')
  async execute(context: ICreatePermissionContext): Promise<Permission> {
    const data = await parseSchemaOrThrow(
      createPermissionSchema,
      context.data,
      'Invalid permission data',
    );

    const existing = await this.permissionRepository.findByAction(data.action);
    if (existing) {
      throw new DuplicateError('Permission with this action already exists');
    }

    return this.permissionRepository.create(data);
  }
}

export class UpdatePermissionUseCase implements IUpdatePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:update')
  async execute(context: IUpdatePermissionContext): Promise<Permission> {
    await requireEntityExists(
      () => this.permissionRepository.findById(context.id),
      `Permission with id ${context.id} not found`,
    );

    const data = await parseSchemaOrThrow(
      updatePermissionSchema,
      context.data,
      'Invalid update permission data',
    );

    return this.permissionRepository.update(context.id, data);
  }
}

export class DeletePermissionUseCase implements IDeletePermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  @RequirePermission('permission:delete')
  async execute(context: IDeletePermissionContext): Promise<void> {
    await requireEntityExists(
      () => this.permissionRepository.findById(context.id),
      `Permission with id ${context.id} not found`,
    );

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

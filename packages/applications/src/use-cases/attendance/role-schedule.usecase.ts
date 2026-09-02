import type {
  IAssignRoleWorkScheduleContext,
  IAssignRoleWorkScheduleUseCase,
  IDeleteRoleWorkScheduleContext,
  IDeleteRoleWorkScheduleUseCase,
  IGetCurrentRoleWorkScheduleContext,
  IGetCurrentRoleWorkScheduleUseCase,
  IGetRoleWorkScheduleContext,
  IGetRoleWorkScheduleUseCase,
  IGetRoleWorkSchedulesByCompanyContext,
  IGetRoleWorkSchedulesByCompanyUseCase,
  IGetRoleWorkSchedulesContext,
  IGetRoleWorkSchedulesUseCase,
  IUpdateRoleWorkScheduleContext,
  IUpdateRoleWorkScheduleUseCase,
} from '@repo/domains/applications/attendance';
import type { RoleWorkSchedule } from '@repo/domains/entities/attendance';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import type {
  IRoleWorkScheduleRepository,
  IWorkShiftRepository,
} from '@repo/domains/repositories/attendance';
import {
  createRoleWorkScheduleSchema,
  updateRoleWorkScheduleSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class AssignRoleWorkScheduleUseCase
  implements IAssignRoleWorkScheduleUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly shiftRepository: IWorkShiftRepository,
  ) {}

  @RequirePermission('role_work_schedule:create')
  async execute(
    context: IAssignRoleWorkScheduleContext,
  ): Promise<RoleWorkSchedule> {
    const parsed = await createRoleWorkScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid role work schedule data',
        parsed.error.format(),
      );
    }

    const roleEntity = await this.roleRepository.findById(parsed.data.roleId);
    if (!roleEntity) {
      throw new NotFoundError(`Role with id ${parsed.data.roleId} not found`);
    }

    const shift = await this.shiftRepository.findById(parsed.data.workShiftId);
    if (!shift) {
      throw new NotFoundError(
        `Work shift with id ${parsed.data.workShiftId} not found`,
      );
    }

    return this.roleScheduleRepository.create(parsed.data);
  }
}

export class UpdateRoleWorkScheduleUseCase
  implements IUpdateRoleWorkScheduleUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
    private readonly shiftRepository: IWorkShiftRepository,
  ) {}

  @RequirePermission('role_work_schedule:update')
  async execute(
    context: IUpdateRoleWorkScheduleContext,
  ): Promise<RoleWorkSchedule> {
    const existing = await this.roleScheduleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Role work schedule with id ${context.id} not found`,
      );
    }

    const parsed = await updateRoleWorkScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update role work schedule data',
        parsed.error.format(),
      );
    }

    if (parsed.data.workShiftId) {
      const shift = await this.shiftRepository.findById(
        parsed.data.workShiftId,
      );
      if (!shift) {
        throw new NotFoundError(
          `Work shift with id ${parsed.data.workShiftId} not found`,
        );
      }
    }

    return this.roleScheduleRepository.update(context.id, parsed.data);
  }
}

export class DeleteRoleWorkScheduleUseCase
  implements IDeleteRoleWorkScheduleUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
  ) {}

  @RequirePermission('role_work_schedule:delete')
  async execute(context: IDeleteRoleWorkScheduleContext): Promise<void> {
    const existing = await this.roleScheduleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Role work schedule with id ${context.id} not found`,
      );
    }
    await this.roleScheduleRepository.delete(context.id);
  }
}

export class GetRoleWorkScheduleUseCase implements IGetRoleWorkScheduleUseCase {
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
  ) {}

  @RequirePermission('role_work_schedule:read')
  async execute(
    context: IGetRoleWorkScheduleContext,
  ): Promise<RoleWorkSchedule | null> {
    const item = await this.roleScheduleRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Role work schedule with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetRoleWorkSchedulesUseCase
  implements IGetRoleWorkSchedulesUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
  ) {}

  @RequirePermission('role_work_schedule:read')
  async execute(
    context: IGetRoleWorkSchedulesContext,
  ): Promise<RoleWorkSchedule[]> {
    return this.roleScheduleRepository.findByRoleId(context.roleId);
  }
}

export class GetRoleWorkSchedulesByCompanyUseCase
  implements IGetRoleWorkSchedulesByCompanyUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
  ) {}

  @RequirePermission('role_work_schedule:read')
  async execute(
    context: IGetRoleWorkSchedulesByCompanyContext,
  ): Promise<RoleWorkSchedule[]> {
    return this.roleScheduleRepository.findByCompanyId(context.companyId);
  }
}

export class GetCurrentRoleWorkScheduleUseCase
  implements IGetCurrentRoleWorkScheduleUseCase
{
  constructor(
    private readonly roleScheduleRepository: IRoleWorkScheduleRepository,
  ) {}

  @RequirePermission('role_work_schedule:read')
  async execute(
    context: IGetCurrentRoleWorkScheduleContext,
  ): Promise<RoleWorkSchedule | null> {
    const targetDate = context.date ?? new Date();
    return this.roleScheduleRepository.findCurrentByRoleId(
      context.roleId,
      targetDate,
    );
  }
}

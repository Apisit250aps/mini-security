import { PermissionGuard } from '../../lib/guard';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateCheckInScheduleContext,
  ICreateCheckInScheduleUseCase,
  ICreateScheduleSlotContext,
  ICreateScheduleSlotUseCase,
  IDeleteScheduleSlotContext,
  IDeleteScheduleSlotUseCase,
  IGetCheckInSchedulesByRoleContext,
  IGetCheckInSchedulesByRoleUseCase,
  IGetCheckInSchedulesByCompanyContext,
  IGetCheckInSchedulesByCompanyUseCase,
  IGetScheduleSlotsByScheduleContext,
  IGetScheduleSlotsByScheduleUseCase,
  IUpdateCheckInScheduleContext,
  IUpdateCheckInScheduleUseCase,
  IUpdateScheduleSlotContext,
  IUpdateScheduleSlotUseCase,
} from '@repo/domains/applications/attendance';
import type {
  CheckInSchedule,
  ScheduleSlot,
} from '@repo/domains/entities/attendance';
import type {
  ICheckInScheduleRepository,
  IScheduleSlotRepository,
} from '@repo/domains/repositories/attendance';
import {
  createCheckInScheduleSchema,
  createScheduleSlotSchema,
  updateCheckInScheduleSchema,
  updateScheduleSlotSchema,
} from '@repo/domains/schema/attendance';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

async function validateAssignedRoles(
  repository: IRoleRepository,
  companyId: string,
  roleIds: string[],
) {
  const roles = await Promise.all(roleIds.map((id) => repository.findById(id)));
  if (
    roles.some(
      (role) =>
        !role ||
        (role.companyId !== companyId &&
          !(role.companyId == null && role.isSystemDefault)),
    )
  ) {
    throw new ValidationError(
      'Schedules can only be assigned to company roles or system default roles',
    );
  }
}

// ==========================================
// Check-In Schedules Use Cases
// ==========================================

export class CreateCheckInScheduleUseCase
  implements ICreateCheckInScheduleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(
    context: ICreateCheckInScheduleContext,
  ): Promise<CheckInSchedule> {
    const parsed = await createCheckInScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid check-in schedule data',
        parsed.error.format(),
      );
    }

    await validateAssignedRoles(
      this.roleRepository,
      parsed.data.companyId,
      parsed.data.roleIds,
    );

    return this.scheduleRepository.create(parsed.data);
  }
}

export class UpdateCheckInScheduleUseCase
  implements IUpdateCheckInScheduleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  @RequirePermission<UpdateCheckInScheduleUseCase, CheckInSchedule>(
    'attendance_schedule:manage',
    {
      resolveResource: (instance, context) =>
        instance.scheduleRepository.findById(context.id!),
      notFoundMessage: 'Check-in schedule not found',
    },
  )
  async execute(
    context: IUpdateCheckInScheduleContext,
    schedule?: CheckInSchedule,
  ): Promise<CheckInSchedule> {
    const parsed = await updateCheckInScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update check-in schedule data',
        parsed.error.format(),
      );
    }

    if (parsed.data.roleIds) {
      await validateAssignedRoles(
        this.roleRepository,
        schedule!.companyId,
        parsed.data.roleIds,
      );
    }
    return this.scheduleRepository.update(context.id, parsed.data);
  }
}

export class GetCheckInSchedulesByRoleUseCase
  implements IGetCheckInSchedulesByRoleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetCheckInSchedulesByRoleContext,
  ): Promise<CheckInSchedule[]> {
    return this.scheduleRepository.findByRoleId(
      context.companyId,
      context.roleId,
    );
  }
}

export class GetCheckInSchedulesByCompanyUseCase
  implements IGetCheckInSchedulesByCompanyUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetCheckInSchedulesByCompanyContext,
  ): Promise<CheckInSchedule[]> {
    return this.scheduleRepository.findByCompanyId(context.companyId);
  }
}

// ==========================================
// Schedule Slots Use Cases
// ==========================================

export class CreateScheduleSlotUseCase implements ICreateScheduleSlotUseCase {
  constructor(
    private readonly slotRepository: IScheduleSlotRepository,
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(context: ICreateScheduleSlotContext): Promise<ScheduleSlot> {
    const parsed = await createScheduleSlotSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid schedule slot data',
        parsed.error.format(),
      );
    }

    const schedule = await this.scheduleRepository.findById(
      parsed.data.checkInScheduleId,
    );
    if (!schedule) {
      throw new NotFoundError(
        `Check-in schedule with id "${parsed.data.checkInScheduleId}" not found`,
      );
    }

    PermissionGuard.requireCompanyScope(context, schedule.companyId);

    const existingOrder = await this.slotRepository.findByScheduleIdAndOrder(
      parsed.data.checkInScheduleId,
      parsed.data.slotOrder,
    );
    if (existingOrder) {
      throw new DuplicateError(
        `Slot with order "${parsed.data.slotOrder}" already exists for this schedule`,
      );
    }

    return this.slotRepository.create(parsed.data);
  }
}

export class UpdateScheduleSlotUseCase implements IUpdateScheduleSlotUseCase {
  constructor(
    private readonly slotRepository: IScheduleSlotRepository,
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(context: IUpdateScheduleSlotContext): Promise<ScheduleSlot> {
    const existing = await this.slotRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Schedule slot with id "${context.id}" not found`,
      );
    }

    const schedule = await this.scheduleRepository.findById(
      existing.checkInScheduleId,
    );
    if (!schedule) throw new NotFoundError('Check-in schedule not found');
    PermissionGuard.requireCompanyScope(context, schedule.companyId);
    const parsed = await updateScheduleSlotSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update schedule slot data',
        parsed.error.format(),
      );
    }

    return this.slotRepository.update(context.id, parsed.data);
  }
}

export class DeleteScheduleSlotUseCase implements IDeleteScheduleSlotUseCase {
  constructor(
    private readonly slotRepository: IScheduleSlotRepository,
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(context: IDeleteScheduleSlotContext): Promise<void> {
    const existing = await this.slotRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Schedule slot with id "${context.id}" not found`,
      );
    }

    const schedule = await this.scheduleRepository.findById(
      existing.checkInScheduleId,
    );
    if (!schedule) throw new NotFoundError('Check-in schedule not found');
    PermissionGuard.requireCompanyScope(context, schedule.companyId);
    await this.slotRepository.delete(context.id);
  }
}

export class GetScheduleSlotsByScheduleUseCase
  implements IGetScheduleSlotsByScheduleUseCase
{
  constructor(
    private readonly slotRepository: IScheduleSlotRepository,
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetScheduleSlotsByScheduleContext,
  ): Promise<ScheduleSlot[]> {
    const schedule = await this.scheduleRepository.findById(
      context.checkInScheduleId,
    );
    if (!schedule) throw new NotFoundError('Check-in schedule not found');
    PermissionGuard.requireCompanyScope(context, schedule.companyId);
    return this.slotRepository.findByScheduleId(context.checkInScheduleId);
  }
}

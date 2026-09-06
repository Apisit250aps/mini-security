import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateCheckInScheduleContext,
  ICreateCheckInScheduleUseCase,
  ICreateScheduleSlotContext,
  ICreateScheduleSlotUseCase,
  IDeleteScheduleSlotContext,
  IDeleteScheduleSlotUseCase,
  IGetCheckInScheduleByRoleContext,
  IGetCheckInScheduleByRoleUseCase,
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

// ==========================================
// Check-In Schedules Use Cases
// ==========================================

export class CreateCheckInScheduleUseCase
  implements ICreateCheckInScheduleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
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

    const existing = await this.scheduleRepository.findByRoleId(
      parsed.data.roleId,
    );
    if (existing) {
      throw new DuplicateError(
        `Check-in schedule already exists for role "${parsed.data.roleId}"`,
      );
    }

    return this.scheduleRepository.create(parsed.data);
  }
}

export class UpdateCheckInScheduleUseCase
  implements IUpdateCheckInScheduleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(
    context: IUpdateCheckInScheduleContext,
  ): Promise<CheckInSchedule> {
    const existing = await this.scheduleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Check-in schedule with id "${context.id}" not found`,
      );
    }

    const parsed = await updateCheckInScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update check-in schedule data',
        parsed.error.format(),
      );
    }

    return this.scheduleRepository.update(context.id, parsed.data);
  }
}

export class GetCheckInScheduleByRoleUseCase
  implements IGetCheckInScheduleByRoleUseCase
{
  constructor(
    private readonly scheduleRepository: ICheckInScheduleRepository,
  ) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetCheckInScheduleByRoleContext,
  ): Promise<CheckInSchedule | null> {
    return this.scheduleRepository.findByRoleId(context.roleId);
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
  constructor(private readonly slotRepository: IScheduleSlotRepository) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(context: IUpdateScheduleSlotContext): Promise<ScheduleSlot> {
    const existing = await this.slotRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Schedule slot with id "${context.id}" not found`,
      );
    }

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
  constructor(private readonly slotRepository: IScheduleSlotRepository) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(context: IDeleteScheduleSlotContext): Promise<void> {
    const existing = await this.slotRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Schedule slot with id "${context.id}" not found`,
      );
    }

    await this.slotRepository.delete(context.id);
  }
}

export class GetScheduleSlotsByScheduleUseCase
  implements IGetScheduleSlotsByScheduleUseCase
{
  constructor(private readonly slotRepository: IScheduleSlotRepository) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetScheduleSlotsByScheduleContext,
  ): Promise<ScheduleSlot[]> {
    return this.slotRepository.findByScheduleId(context.checkInScheduleId);
  }
}

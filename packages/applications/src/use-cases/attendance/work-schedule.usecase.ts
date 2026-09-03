import type {
  ICreateWorkScheduleContext,
  ICreateWorkScheduleUseCase,
  ICreateWorkShiftContext,
  ICreateWorkShiftUseCase,
  IDeleteWorkScheduleContext,
  IDeleteWorkScheduleUseCase,
  IDeleteWorkShiftContext,
  IDeleteWorkShiftUseCase,
  IGetWorkScheduleContext,
  IGetWorkScheduleUseCase,
  IGetWorkSchedulesContext,
  IGetWorkSchedulesUseCase,
  IGetWorkShiftContext,
  IGetWorkShiftUseCase,
  IGetWorkShiftsContext,
  IGetWorkShiftsUseCase,
  IGetCompanyWorkShiftsContext,
  IGetCompanyWorkShiftsUseCase,
  IUpdateWorkScheduleContext,
  IUpdateWorkScheduleUseCase,
  IUpdateWorkShiftContext,
  IUpdateWorkShiftUseCase,
} from '@repo/domains/applications/attendance';
import type {
  WorkSchedule,
  WorkShift,
} from '@repo/domains/entities/attendance';
import type {
  IWorkScheduleRepository,
  IWorkShiftRepository,
} from '@repo/domains/repositories/attendance';
import {
  createWorkScheduleSchema,
  createWorkShiftSchema,
  updateWorkScheduleSchema,
  updateWorkShiftSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class CreateWorkScheduleUseCase implements ICreateWorkScheduleUseCase {
  constructor(private readonly repository: IWorkScheduleRepository) {}

  @RequirePermission('work_schedule:create')
  async execute(context: ICreateWorkScheduleContext): Promise<WorkSchedule> {
    const parsed = await createWorkScheduleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid work schedule data',
        parsed.error.format(),
      );
    }
    return this.repository.create(parsed.data);
  }
}

export class UpdateWorkScheduleUseCase implements IUpdateWorkScheduleUseCase {
  constructor(private readonly repository: IWorkScheduleRepository) {}

  @RequirePermission('work_schedule:update')
  async execute(context: IUpdateWorkScheduleContext): Promise<WorkSchedule> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Work schedule with id ${context.id} not found`);
    }

    const parsed = await updateWorkScheduleSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update work schedule data',
        parsed.error.format(),
      );
    }

    return this.repository.update(context.id, parsed.data);
  }
}

export class DeleteWorkScheduleUseCase implements IDeleteWorkScheduleUseCase {
  constructor(private readonly repository: IWorkScheduleRepository) {}

  @RequirePermission('work_schedule:delete')
  async execute(context: IDeleteWorkScheduleContext): Promise<void> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Work schedule with id ${context.id} not found`);
    }
    await this.repository.delete(context.id);
  }
}

export class GetWorkScheduleUseCase implements IGetWorkScheduleUseCase {
  constructor(private readonly repository: IWorkScheduleRepository) {}

  @RequirePermission('work_schedule:read')
  async execute(
    context: IGetWorkScheduleContext,
  ): Promise<WorkSchedule | null> {
    const item = await this.repository.findById(context.id);
    if (!item) {
      throw new NotFoundError(`Work schedule with id ${context.id} not found`);
    }
    return item;
  }
}

export class GetWorkSchedulesUseCase implements IGetWorkSchedulesUseCase {
  constructor(private readonly repository: IWorkScheduleRepository) {}

  @RequirePermission('work_schedule:read')
  async execute(context: IGetWorkSchedulesContext): Promise<WorkSchedule[]> {
    return this.repository.findByCompanyId(context.companyId);
  }
}

// Work Shift Use Cases
export class CreateWorkShiftUseCase implements ICreateWorkShiftUseCase {
  constructor(
    private readonly shiftRepository: IWorkShiftRepository,
    private readonly scheduleRepository: IWorkScheduleRepository,
  ) {}

  @RequirePermission('work_shift:create')
  async execute(context: ICreateWorkShiftContext): Promise<WorkShift> {
    const parsed = await createWorkShiftSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid work shift data',
        parsed.error.format(),
      );
    }

    const schedule = await this.scheduleRepository.findById(
      parsed.data.workScheduleId,
    );
    if (!schedule) {
      throw new NotFoundError(
        `Work schedule with id ${parsed.data.workScheduleId} not found`,
      );
    }

    return this.shiftRepository.create(parsed.data);
  }
}

export class UpdateWorkShiftUseCase implements IUpdateWorkShiftUseCase {
  constructor(private readonly shiftRepository: IWorkShiftRepository) {}

  @RequirePermission('work_shift:update')
  async execute(context: IUpdateWorkShiftContext): Promise<WorkShift> {
    const existing = await this.shiftRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Work shift with id ${context.id} not found`);
    }

    const parsed = await updateWorkShiftSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update work shift data',
        parsed.error.format(),
      );
    }

    return this.shiftRepository.update(context.id, parsed.data);
  }
}

export class DeleteWorkShiftUseCase implements IDeleteWorkShiftUseCase {
  constructor(private readonly shiftRepository: IWorkShiftRepository) {}

  @RequirePermission('work_shift:delete')
  async execute(context: IDeleteWorkShiftContext): Promise<void> {
    const existing = await this.shiftRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Work shift with id ${context.id} not found`);
    }
    await this.shiftRepository.delete(context.id);
  }
}

export class GetWorkShiftUseCase implements IGetWorkShiftUseCase {
  constructor(private readonly shiftRepository: IWorkShiftRepository) {}

  @RequirePermission('work_shift:read')
  async execute(context: IGetWorkShiftContext): Promise<WorkShift | null> {
    const item = await this.shiftRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(`Work shift with id ${context.id} not found`);
    }
    return item;
  }
}

export class GetWorkShiftsUseCase implements IGetWorkShiftsUseCase {
  constructor(private readonly shiftRepository: IWorkShiftRepository) {}

  @RequirePermission('work_shift:read')
  async execute(context: IGetWorkShiftsContext): Promise<WorkShift[]> {
    return this.shiftRepository.findByWorkScheduleId(context.workScheduleId);
  }
}

export class GetCompanyWorkShiftsUseCase
  implements IGetCompanyWorkShiftsUseCase
{
  constructor(private readonly shiftRepository: IWorkShiftRepository) {}

  @RequirePermission('work_shift:read')
  async execute(context: IGetCompanyWorkShiftsContext): Promise<WorkShift[]> {
    return this.shiftRepository.findByCompanyId(context.companyId);
  }
}

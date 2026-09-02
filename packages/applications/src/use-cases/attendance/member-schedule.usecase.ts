import type {
  IAssignMemberWorkScheduleContext,
  IAssignMemberWorkScheduleUseCase,
  IDeleteMemberWorkScheduleContext,
  IDeleteMemberWorkScheduleUseCase,
  IGetCurrentMemberWorkScheduleContext,
  IGetCurrentMemberWorkScheduleUseCase,
  IGetMemberWorkScheduleContext,
  IGetMemberWorkScheduleUseCase,
  IGetMemberWorkSchedulesContext,
  IGetMemberWorkSchedulesUseCase,
  IUpdateMemberWorkScheduleContext,
  IUpdateMemberWorkScheduleUseCase,
} from '@repo/domains/applications/attendance';
import type { MemberWorkSchedule } from '@repo/domains/entities/attendance';
import type {
  IMemberWorkScheduleRepository,
  IWorkShiftRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  createMemberWorkScheduleSchema,
  updateMemberWorkScheduleSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class AssignMemberWorkScheduleUseCase
  implements IAssignMemberWorkScheduleUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly shiftRepository: IWorkShiftRepository,
  ) {}

  @RequirePermission('member_work_schedule:create')
  async execute(
    context: IAssignMemberWorkScheduleContext,
  ): Promise<MemberWorkSchedule> {
    const parsed = await createMemberWorkScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid member work schedule data',
        parsed.error.format(),
      );
    }

    const member = await this.memberRepository.findById(
      parsed.data.companyMemberId,
    );
    if (!member) {
      throw new NotFoundError(
        `Company member with id ${parsed.data.companyMemberId} not found`,
      );
    }

    const shift = await this.shiftRepository.findById(parsed.data.workShiftId);
    if (!shift) {
      throw new NotFoundError(
        `Work shift with id ${parsed.data.workShiftId} not found`,
      );
    }

    return this.memberScheduleRepository.create(parsed.data);
  }
}

export class UpdateMemberWorkScheduleUseCase
  implements IUpdateMemberWorkScheduleUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
    private readonly shiftRepository: IWorkShiftRepository,
  ) {}

  @RequirePermission('member_work_schedule:update')
  async execute(
    context: IUpdateMemberWorkScheduleContext,
  ): Promise<MemberWorkSchedule> {
    const existing = await this.memberScheduleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Member work schedule with id ${context.id} not found`,
      );
    }

    const parsed = await updateMemberWorkScheduleSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update member work schedule data',
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

    return this.memberScheduleRepository.update(context.id, parsed.data);
  }
}

export class DeleteMemberWorkScheduleUseCase
  implements IDeleteMemberWorkScheduleUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
  ) {}

  @RequirePermission('member_work_schedule:delete')
  async execute(context: IDeleteMemberWorkScheduleContext): Promise<void> {
    const existing = await this.memberScheduleRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Member work schedule with id ${context.id} not found`,
      );
    }
    await this.memberScheduleRepository.delete(context.id);
  }
}

export class GetMemberWorkScheduleUseCase
  implements IGetMemberWorkScheduleUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
  ) {}

  @RequirePermission('member_work_schedule:read')
  async execute(
    context: IGetMemberWorkScheduleContext,
  ): Promise<MemberWorkSchedule | null> {
    const item = await this.memberScheduleRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Member work schedule with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetMemberWorkSchedulesUseCase
  implements IGetMemberWorkSchedulesUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
  ) {}

  @RequirePermission('member_work_schedule:read')
  async execute(
    context: IGetMemberWorkSchedulesContext,
  ): Promise<MemberWorkSchedule[]> {
    return this.memberScheduleRepository.findByMemberId(
      context.companyMemberId,
    );
  }
}

export class GetCurrentMemberWorkScheduleUseCase
  implements IGetCurrentMemberWorkScheduleUseCase
{
  constructor(
    private readonly memberScheduleRepository: IMemberWorkScheduleRepository,
  ) {}

  @RequirePermission('member_work_schedule:read')
  async execute(
    context: IGetCurrentMemberWorkScheduleContext,
  ): Promise<MemberWorkSchedule | null> {
    const targetDate = context.date ?? new Date();
    return this.memberScheduleRepository.findCurrentByMemberId(
      context.companyMemberId,
      targetDate,
    );
  }
}

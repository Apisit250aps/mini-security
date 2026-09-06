import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateLeaveQuotaContext,
  ICreateLeaveQuotaUseCase,
  IGetLeaveQuotasByMemberContext,
  IGetLeaveQuotasByMemberUseCase,
  IUpdateLeaveQuotaContext,
  IUpdateLeaveQuotaUseCase,
} from '@repo/domains/applications/leave';
import type { LeaveQuota } from '@repo/domains/entities/leave';
import type { ILeaveQuotaRepository } from '@repo/domains/repositories/leave';
import {
  createLeaveQuotaSchema,
  updateLeaveQuotaSchema,
} from '@repo/domains/schema/leave';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateLeaveQuotaUseCase implements ICreateLeaveQuotaUseCase {
  constructor(private readonly leaveQuotaRepository: ILeaveQuotaRepository) {}

  @RequirePermission('leave_quota:manage')
  async execute(context: ICreateLeaveQuotaContext): Promise<LeaveQuota> {
    const parsed = await createLeaveQuotaSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid leave quota data',
        parsed.error.format(),
      );
    }

    const existing = await this.leaveQuotaRepository.findByMemberTypeAndYear(
      parsed.data.companyMemberId,
      parsed.data.leaveTypeId,
      parsed.data.year,
    );
    if (existing) {
      throw new DuplicateError(
        `Leave quota already exists for member and leave type in year ${parsed.data.year}`,
      );
    }

    return this.leaveQuotaRepository.create(parsed.data);
  }
}

export class UpdateLeaveQuotaUseCase implements IUpdateLeaveQuotaUseCase {
  constructor(private readonly leaveQuotaRepository: ILeaveQuotaRepository) {}

  @RequirePermission('leave_quota:manage')
  async execute(context: IUpdateLeaveQuotaContext): Promise<LeaveQuota> {
    const existing = await this.leaveQuotaRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Leave quota with id "${context.id}" not found`);
    }

    const parsed = await updateLeaveQuotaSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update leave quota data',
        parsed.error.format(),
      );
    }

    return this.leaveQuotaRepository.update(context.id, parsed.data);
  }
}

export class GetLeaveQuotasByMemberUseCase
  implements IGetLeaveQuotasByMemberUseCase
{
  constructor(private readonly leaveQuotaRepository: ILeaveQuotaRepository) {}

  @RequirePermission('leave_quota:read')
  async execute(
    context: IGetLeaveQuotasByMemberContext,
  ): Promise<LeaveQuota[]> {
    return this.leaveQuotaRepository.findByMemberAndYear(
      context.companyMemberId,
      context.year,
    );
  }
}

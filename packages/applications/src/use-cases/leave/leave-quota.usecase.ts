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
import { DuplicateError } from '../../lib/error';
import { requireEntityExists } from '../../lib/guards';
import { parseSchemaOrThrow } from '../../lib/validation';

export class CreateLeaveQuotaUseCase implements ICreateLeaveQuotaUseCase {
  constructor(private readonly leaveQuotaRepository: ILeaveQuotaRepository) {}

  @RequirePermission('leave_quota:manage')
  async execute(context: ICreateLeaveQuotaContext): Promise<LeaveQuota> {
    const data = await parseSchemaOrThrow(
      createLeaveQuotaSchema,
      context.data,
      'Invalid leave quota data',
    );

    const existing = await this.leaveQuotaRepository.findByMemberTypeAndYear(
      data.companyMemberId,
      data.leaveTypeId,
      data.year,
    );
    if (existing) {
      throw new DuplicateError(
        `Leave quota already exists for member and leave type in year ${data.year}`,
      );
    }

    return this.leaveQuotaRepository.create(data);
  }
}

export class UpdateLeaveQuotaUseCase implements IUpdateLeaveQuotaUseCase {
  constructor(private readonly leaveQuotaRepository: ILeaveQuotaRepository) {}

  @RequirePermission('leave_quota:manage')
  async execute(context: IUpdateLeaveQuotaContext): Promise<LeaveQuota> {
    await requireEntityExists(
      () => this.leaveQuotaRepository.findById(context.id),
      `Leave quota with id "${context.id}" not found`,
    );

    const data = await parseSchemaOrThrow(
      updateLeaveQuotaSchema,
      context.data,
      'Invalid update leave quota data',
    );

    return this.leaveQuotaRepository.update(context.id, data);
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

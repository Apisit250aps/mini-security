import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateLeaveTypeContext,
  ICreateLeaveTypeUseCase,
  IGetLeaveTypesByCompanyContext,
  IGetLeaveTypesByCompanyUseCase,
  IUpdateLeaveTypeContext,
  IUpdateLeaveTypeUseCase,
} from '@repo/domains/applications/leave';
import type { LeaveType } from '@repo/domains/entities/leave';
import type { ILeaveTypeRepository } from '@repo/domains/repositories/leave';
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from '@repo/domains/schema/leave';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateLeaveTypeUseCase implements ICreateLeaveTypeUseCase {
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:manage')
  async execute(context: ICreateLeaveTypeContext): Promise<LeaveType> {
    const parsed = await createLeaveTypeSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid leave type data',
        parsed.error.format(),
      );
    }

    const existing = await this.leaveTypeRepository.findByNameAndCompany(
      parsed.data.companyId,
      parsed.data.name,
    );
    if (existing) {
      throw new DuplicateError(
        `Leave type with name "${parsed.data.name}" already exists for this company`,
      );
    }

    return this.leaveTypeRepository.create(parsed.data);
  }
}

export class UpdateLeaveTypeUseCase implements IUpdateLeaveTypeUseCase {
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:manage')
  async execute(context: IUpdateLeaveTypeContext): Promise<LeaveType> {
    const existing = await this.leaveTypeRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Leave type with id "${context.id}" not found`);
    }

    const parsed = await updateLeaveTypeSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update leave type data',
        parsed.error.format(),
      );
    }

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await this.leaveTypeRepository.findByNameAndCompany(
        existing.companyId,
        parsed.data.name,
      );
      if (duplicate) {
        throw new DuplicateError(
          `Leave type with name "${parsed.data.name}" already exists for this company`,
        );
      }
    }

    return this.leaveTypeRepository.update(context.id, parsed.data);
  }
}

export class GetLeaveTypesByCompanyUseCase
  implements IGetLeaveTypesByCompanyUseCase
{
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:read')
  async execute(context: IGetLeaveTypesByCompanyContext): Promise<LeaveType[]> {
    if (context.onlyActive) {
      return this.leaveTypeRepository.findActiveByCompanyId(context.companyId);
    }
    return this.leaveTypeRepository.findByCompanyId(context.companyId);
  }
}

import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICreateLeaveTypeContext,
  ICreateLeaveTypeUseCase,
  IGetLeaveTypesByOrganizationContext,
  IGetLeaveTypesByOrganizationUseCase,
  IUpdateLeaveTypeContext,
  IUpdateLeaveTypeUseCase,
} from '@repo/domains/applications/leave';
import type { LeaveType } from '@repo/domains/entities/leave';
import type { ILeaveTypeRepository } from '@repo/domains/repositories/leave';
import {
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
} from '@repo/domains/schema/leave';
import { DuplicateError } from '../../lib/error';
import { requireEntityExists } from '../../lib/guards';
import { parseSchemaOrThrow } from '../../lib/validation';

export class CreateLeaveTypeUseCase implements ICreateLeaveTypeUseCase {
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:manage')
  async execute(context: ICreateLeaveTypeContext): Promise<LeaveType> {
    const data = await parseSchemaOrThrow(
      createLeaveTypeSchema,
      context.data,
      'Invalid leave type data',
    );

    const existing = await this.leaveTypeRepository.findByNameAndOrganization(
      data.organizationId,
      data.name,
    );
    if (existing) {
      throw new DuplicateError(
        `Leave type with name "${data.name}" already exists for this organization`,
      );
    }

    return this.leaveTypeRepository.create(data);
  }
}

export class UpdateLeaveTypeUseCase implements IUpdateLeaveTypeUseCase {
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:manage')
  async execute(context: IUpdateLeaveTypeContext): Promise<LeaveType> {
    const existing = await requireEntityExists(
      () => this.leaveTypeRepository.findById(context.id),
      `Leave type with id "${context.id}" not found`,
    );

    const data = await parseSchemaOrThrow(
      updateLeaveTypeSchema,
      context.data,
      'Invalid update leave type data',
    );

    if (data.name && data.name !== existing.name) {
      const duplicate =
        await this.leaveTypeRepository.findByNameAndOrganization(
          existing.organizationId,
          data.name,
        );
      if (duplicate) {
        throw new DuplicateError(
          `Leave type with name "${data.name}" already exists for this organization`,
        );
      }
    }

    return this.leaveTypeRepository.update(context.id, data);
  }
}

export class GetLeaveTypesByOrganizationUseCase
  implements IGetLeaveTypesByOrganizationUseCase
{
  constructor(private readonly leaveTypeRepository: ILeaveTypeRepository) {}

  @RequirePermission('leave_type:read')
  async execute(
    context: IGetLeaveTypesByOrganizationContext,
  ): Promise<LeaveType[]> {
    if (context.onlyActive) {
      return this.leaveTypeRepository.findActiveByOrganizationId(
        context.organizationId,
      );
    }
    return this.leaveTypeRepository.findByOrganizationId(
      context.organizationId,
    );
  }
}

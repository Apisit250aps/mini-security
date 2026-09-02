import type {
  ICreateLeaveRequestContext,
  ICreateLeaveRequestUseCase,
  IDeleteLeaveRequestContext,
  IDeleteLeaveRequestUseCase,
  IGetLeaveRequestContext,
  IGetLeaveRequestUseCase,
  IGetLeaveRequestsContext,
  IGetLeaveRequestsUseCase,
  IReviewLeaveRequestContext,
  IReviewLeaveRequestUseCase,
  IUpdateLeaveRequestContext,
  IUpdateLeaveRequestUseCase,
} from '@repo/domains/applications/attendance';
import type { LeaveRequest } from '@repo/domains/entities/attendance';
import type { ILeaveRequestRepository } from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class CreateLeaveRequestUseCase implements ICreateLeaveRequestUseCase {
  constructor(
    private readonly leaveRepository: ILeaveRequestRepository,
    private readonly memberRepository: ICompanyMemberRepository,
  ) {}

  @RequirePermission('leave_request:create')
  async execute(context: ICreateLeaveRequestContext): Promise<LeaveRequest> {
    const parsed = await createLeaveRequestSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid leave request data',
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

    return this.leaveRepository.create(parsed.data);
  }
}

export class UpdateLeaveRequestUseCase implements IUpdateLeaveRequestUseCase {
  constructor(private readonly leaveRepository: ILeaveRequestRepository) {}

  @RequirePermission('leave_request:update')
  async execute(context: IUpdateLeaveRequestContext): Promise<LeaveRequest> {
    const existing = await this.leaveRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Leave request with id ${context.id} not found`);
    }

    const parsed = await updateLeaveRequestSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update leave request data',
        parsed.error.format(),
      );
    }

    return this.leaveRepository.update(context.id, parsed.data);
  }
}

export class DeleteLeaveRequestUseCase implements IDeleteLeaveRequestUseCase {
  constructor(private readonly leaveRepository: ILeaveRequestRepository) {}

  @RequirePermission('leave_request:delete')
  async execute(context: IDeleteLeaveRequestContext): Promise<void> {
    const existing = await this.leaveRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Leave request with id ${context.id} not found`);
    }
    await this.leaveRepository.delete(context.id);
  }
}

export class GetLeaveRequestUseCase implements IGetLeaveRequestUseCase {
  constructor(private readonly leaveRepository: ILeaveRequestRepository) {}

  @RequirePermission('leave_request:read')
  async execute(
    context: IGetLeaveRequestContext,
  ): Promise<LeaveRequest | null> {
    const item = await this.leaveRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(`Leave request with id ${context.id} not found`);
    }
    return item;
  }
}

export class GetLeaveRequestsUseCase implements IGetLeaveRequestsUseCase {
  constructor(private readonly leaveRepository: ILeaveRequestRepository) {}

  @RequirePermission('leave_request:read')
  async execute(context: IGetLeaveRequestsContext): Promise<LeaveRequest[]> {
    if (context.memberId) {
      return this.leaveRepository.findByMemberId(context.memberId);
    }
    if (context.status) {
      return this.leaveRepository.findByStatus(
        context.companyId,
        context.status,
      );
    }
    return this.leaveRepository.findByCompanyId(context.companyId);
  }
}

export class ReviewLeaveRequestUseCase implements IReviewLeaveRequestUseCase {
  constructor(private readonly leaveRepository: ILeaveRequestRepository) {}

  @RequirePermission('leave_request:approve')
  async execute(context: IReviewLeaveRequestContext): Promise<LeaveRequest> {
    const existing = await this.leaveRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Leave request with id ${context.id} not found`);
    }

    return this.leaveRepository.update(context.id, {
      status: context.status,
      reviewedBy: context.reviewedBy,
      reviewedAt: new Date(),
      reviewNote: context.reviewNote ?? existing.reviewNote,
    });
  }
}

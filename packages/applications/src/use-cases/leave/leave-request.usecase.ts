import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICancelLeaveRequestContext,
  ICancelLeaveRequestUseCase,
  IGetLeaveRequestsByCompanyContext,
  IGetLeaveRequestsByCompanyUseCase,
  IGetLeaveRequestsByMemberContext,
  IGetLeaveRequestsByMemberUseCase,
  IReviewLeaveRequestContext,
  IReviewLeaveRequestUseCase,
  ISubmitLeaveRequestContext,
  ISubmitLeaveRequestUseCase,
} from '@repo/domains/applications/leave';
import type { LeaveRequest } from '@repo/domains/entities/leave';
import type {
  IAttendanceLogRepository,
  ICheckInScheduleRepository,
  IScheduleSlotRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import type {
  ILeaveQuotaRepository,
  ILeaveRequestRepository,
  ILeaveTypeRepository,
} from '@repo/domains/repositories/leave';
import { createLeaveRequestSchema } from '@repo/domains/schema/leave';
import { NotFoundError, ValidationError } from '../../lib/error';

export class SubmitLeaveRequestUseCase implements ISubmitLeaveRequestUseCase {
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveQuotaRepository: ILeaveQuotaRepository,
  ) {}

  @RequirePermission('leave_request:create')
  async execute(context: ISubmitLeaveRequestContext): Promise<LeaveRequest> {
    const parsed = await createLeaveRequestSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid leave request data',
        parsed.error.format(),
      );
    }

    const year = new Date(parsed.data.startDate).getFullYear();
    const quota = await this.leaveQuotaRepository.findByMemberTypeAndYear(
      parsed.data.companyMemberId,
      parsed.data.leaveTypeId,
      year,
    );

    if (quota) {
      const remainingDays = Number(quota.totalDays) - Number(quota.usedDays);
      if (remainingDays < Number(parsed.data.totalDays)) {
        throw new ValidationError(
          `Insufficient leave quota: requested ${parsed.data.totalDays} days, available ${remainingDays} days`,
        );
      }
    }

    return this.leaveRequestRepository.create({
      ...parsed.data,
      status: 'pending',
    });
  }
}

export class ReviewLeaveRequestUseCase implements IReviewLeaveRequestUseCase {
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveQuotaRepository: ILeaveQuotaRepository,
    private readonly leaveTypeRepository: ILeaveTypeRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly checkInScheduleRepository: ICheckInScheduleRepository,
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    private readonly attendanceLogRepository: IAttendanceLogRepository,
  ) {}

  @RequirePermission('leave_request:approve')
  async execute(context: IReviewLeaveRequestContext): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(context.id);
    if (!leaveRequest) {
      throw new NotFoundError(
        `Leave request with id "${context.id}" not found`,
      );
    }

    if (leaveRequest.status !== 'pending') {
      throw new ValidationError(
        `Cannot review leave request with status "${leaveRequest.status}"`,
      );
    }

    const now = new Date();
    const reviewerId = context.userId ?? null;

    if (context.action === 'rejected') {
      return this.leaveRequestRepository.update(context.id, {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewNote: context.reviewNote ?? null,
      });
    }

    // --- Action: Approved ---
    // 1. Update Leave Request Status
    const updatedRequest = await this.leaveRequestRepository.update(
      context.id,
      {
        status: 'approved',
        reviewedBy: reviewerId,
        reviewedAt: now,
        reviewNote: context.reviewNote ?? null,
      },
    );

    // 2. Deduct Leave Quota
    const year = new Date(leaveRequest.startDate).getFullYear();
    const quota = await this.leaveQuotaRepository.findByMemberTypeAndYear(
      leaveRequest.companyMemberId,
      leaveRequest.leaveTypeId,
      year,
    );

    if (quota) {
      const updatedUsedDays =
        Number(quota.usedDays) + Number(leaveRequest.totalDays);
      await this.leaveQuotaRepository.updateUsedDays(quota.id, updatedUsedDays);
    }

    // 3. Auto-Sync to Attendance Logs (Excused Status)
    const leaveType = await this.leaveTypeRepository.findById(
      leaveRequest.leaveTypeId,
    );
    const leaveTypeName = leaveType ? leaveType.name : 'อนุมัติแล้ว';

    const member = await this.companyMemberRepository.findById(
      leaveRequest.companyMemberId,
    );

    if (member) {
      const schedule = await this.checkInScheduleRepository.findByRoleId(
        member.roleId,
      );

      if (schedule && schedule.isActive) {
        const slots = await this.scheduleSlotRepository.findByScheduleId(
          schedule.id,
        );

        // Generate all dates in the range [startDate, endDate]
        const dates = this.getDateRange(
          leaveRequest.startDate,
          leaveRequest.endDate,
        );

        for (const dateStr of dates) {
          for (const slot of slots) {
            await this.attendanceLogRepository.upsertLog({
              companyMemberId: member.id,
              scheduleSlotId: slot.id,
              workDate: dateStr,
              checkedInAt: null,
              status: 'excused',
              note: `ลางาน: ${leaveTypeName}`,
              recordedBy: reviewerId,
            });
          }
        }
      }
    }

    return updatedRequest;
  }

  private getDateRange(startDateStr: string, endDateStr: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDateStr);
    const end = new Date(endDateStr);

    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}

export class CancelLeaveRequestUseCase implements ICancelLeaveRequestUseCase {
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveQuotaRepository: ILeaveQuotaRepository,
  ) {}

  @RequirePermission('leave_request:cancel')
  async execute(context: ICancelLeaveRequestContext): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findById(context.id);
    if (!leaveRequest) {
      throw new NotFoundError(
        `Leave request with id "${context.id}" not found`,
      );
    }

    if (
      leaveRequest.status !== 'pending' &&
      leaveRequest.status !== 'approved'
    ) {
      throw new ValidationError(
        `Cannot cancel leave request with status "${leaveRequest.status}"`,
      );
    }

    // If already approved, revert quota used_days
    if (leaveRequest.status === 'approved') {
      const year = new Date(leaveRequest.startDate).getFullYear();
      const quota = await this.leaveQuotaRepository.findByMemberTypeAndYear(
        leaveRequest.companyMemberId,
        leaveRequest.leaveTypeId,
        year,
      );

      if (quota) {
        const revertedUsedDays = Math.max(
          0,
          Number(quota.usedDays) - Number(leaveRequest.totalDays),
        );
        await this.leaveQuotaRepository.updateUsedDays(
          quota.id,
          revertedUsedDays,
        );
      }
    }

    return this.leaveRequestRepository.update(context.id, {
      status: 'cancelled',
    });
  }
}

export class GetLeaveRequestsByMemberUseCase
  implements IGetLeaveRequestsByMemberUseCase
{
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
  ) {}

  @RequirePermission('leave_request:read')
  async execute(
    context: IGetLeaveRequestsByMemberContext,
  ): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.findByMemberId(context.companyMemberId);
  }
}

export class GetLeaveRequestsByCompanyUseCase
  implements IGetLeaveRequestsByCompanyUseCase
{
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
  ) {}

  @RequirePermission('leave_request:read')
  async execute(
    context: IGetLeaveRequestsByCompanyContext,
  ): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.findByCompanyId(
      context.companyId,
      context.status,
    );
  }
}

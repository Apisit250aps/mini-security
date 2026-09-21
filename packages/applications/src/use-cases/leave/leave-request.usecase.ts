import type { IUnitOfWork } from '@repo/domains';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICancelLeaveRequestContext,
  ICancelLeaveRequestUseCase,
  IGetLeaveRequestsByOrganizationContext,
  IGetLeaveRequestsByOrganizationUseCase,
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
import type { IOrganizationMemberRepository } from '@repo/domains/repositories/organization';
import type {
  ILeaveQuotaRepository,
  ILeaveRequestRepository,
  ILeaveTypeRepository,
} from '@repo/domains/repositories/leave';
import { createLeaveRequestSchema } from '@repo/domains/schema/leave';
import { NotFoundError, ValidationError } from '../../lib/error';

import { calculateLeaveDays } from '@repo/domains';
export { calculateLeaveDays };

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
      parsed.data.organizationMemberId,
      parsed.data.leaveTypeId,
      year,
    );

    if (quota) {
      const requestedDays = calculateLeaveDays(parsed.data);
      const approvedRequests =
        await this.leaveRequestRepository.findApprovedByMemberTypeAndYear(
          parsed.data.organizationMemberId,
          parsed.data.leaveTypeId,
          year,
        );
      const usedDays = approvedRequests.reduce(
        (sum, req) => sum + calculateLeaveDays(req),
        0,
      );
      const remainingDays = Number(quota.totalDays) - usedDays;
      if (remainingDays < requestedDays) {
        throw new ValidationError(
          `Insufficient leave quota: requested ${requestedDays} days, available ${remainingDays} days`,
        );
      }
    }

    return this.leaveRequestRepository.create(parsed.data);
  }
}

export class ReviewLeaveRequestUseCase implements IReviewLeaveRequestUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveQuotaRepository: ILeaveQuotaRepository,
    private readonly leaveTypeRepository: ILeaveTypeRepository,
    private readonly organizationMemberRepository: IOrganizationMemberRepository,
    private readonly checkInScheduleRepository: ICheckInScheduleRepository,
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    private readonly attendanceLogRepository: IAttendanceLogRepository,
  ) {}

  @RequirePermission('leave_request:approve')
  async execute(context: IReviewLeaveRequestContext): Promise<LeaveRequest> {
    return this.unitOfWork.transaction(async () => {
      const leaveRequest = await this.leaveRequestRepository.findById(
        context.id,
      );
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
      // 1. Concurrency control: Lock quota if exists and verify availability
      const year = new Date(leaveRequest.startDate).getFullYear();
      const quota = await this.leaveQuotaRepository.lockByMemberTypeAndYear(
        leaveRequest.organizationMemberId,
        leaveRequest.leaveTypeId,
        year,
      );

      if (quota) {
        const requestedDays = calculateLeaveDays(leaveRequest);
        const approvedRequests =
          await this.leaveRequestRepository.findApprovedByMemberTypeAndYear(
            leaveRequest.organizationMemberId,
            leaveRequest.leaveTypeId,
            year,
          );
        const usedDays = approvedRequests.reduce(
          (sum, req) => sum + calculateLeaveDays(req),
          0,
        );
        const remainingDays = Number(quota.totalDays) - usedDays;
        if (remainingDays < requestedDays) {
          throw new ValidationError(
            `Insufficient leave quota: requested ${requestedDays} days, available ${remainingDays} days`,
          );
        }
      }

      // 2. Update Leave Request Status
      const updatedRequest = await this.leaveRequestRepository.update(
        context.id,
        {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: now,
          reviewNote: context.reviewNote ?? null,
        },
      );

      // 3. Auto-Sync to Attendance Logs (Excused Status)
      const leaveType = await this.leaveTypeRepository.findById(
        leaveRequest.leaveTypeId,
      );
      const leaveTypeName = leaveType ? leaveType.name : 'อนุมัติแล้ว';

      const member = await this.organizationMemberRepository.findById(
        leaveRequest.organizationMemberId,
      );

      if (member) {
        const schedules = await this.checkInScheduleRepository.findByRoleId(
          member.organizationId,
          member.roleId,
        );

        for (const schedule of schedules.filter((item) => item.isActive)) {
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
                organizationId: member.organizationId,
                organizationMemberId: member.id,
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
    });
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
    private readonly unitOfWork: IUnitOfWork,
    private readonly leaveRequestRepository: ILeaveRequestRepository,
  ) {}

  @RequirePermission('leave_request:cancel')
  async execute(context: ICancelLeaveRequestContext): Promise<LeaveRequest> {
    return this.unitOfWork.transaction(async () => {
      const leaveRequest = await this.leaveRequestRepository.findById(
        context.id,
      );
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

      return this.leaveRequestRepository.update(context.id, {
        status: 'cancelled',
      });
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
    return this.leaveRequestRepository.findByMemberId(
      context.organizationMemberId,
    );
  }
}

export class GetLeaveRequestsByOrganizationUseCase
  implements IGetLeaveRequestsByOrganizationUseCase
{
  constructor(
    private readonly leaveRequestRepository: ILeaveRequestRepository,
  ) {}

  @RequirePermission('leave_request:read')
  async execute(
    context: IGetLeaveRequestsByOrganizationContext,
  ): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.findByOrganizationId(
      context.organizationId,
      context.status,
    );
  }
}

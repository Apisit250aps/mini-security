import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  ICheckInAttendanceContext,
  ICheckInAttendanceUseCase,
  IGetAttendanceLogsByCompanyContext,
  IGetAttendanceLogsByCompanyUseCase,
  IGetAttendanceLogsByMemberContext,
  IGetAttendanceLogsByMemberUseCase,
  IManualCheckInAttendanceContext,
  IManualCheckInAttendanceUseCase,
} from '@repo/domains/applications/attendance';
import type { AttendanceLog } from '@repo/domains/entities/attendance';
import type {
  IAttendanceLogRepository,
  ICheckInScheduleRepository,
  IScheduleSlotRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import { createAttendanceLogSchema } from '@repo/domains/schema/attendance';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CheckInAttendanceUseCase implements ICheckInAttendanceUseCase {
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    private readonly checkInScheduleRepository: ICheckInScheduleRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  @RequirePermission('attendance:check_in')
  async execute(context: ICheckInAttendanceContext): Promise<AttendanceLog> {
    const member = await this.companyMemberRepository.findById(
      context.companyMemberId,
    );
    if (!member) {
      throw new NotFoundError(
        `Company member with id "${context.companyMemberId}" not found`,
      );
    }

    const schedule = await this.checkInScheduleRepository.findByRoleId(
      member.roleId,
    );
    if (!schedule || !schedule.isActive) {
      throw new ValidationError(
        'No active check-in schedule configured for this role',
      );
    }

    const slots = await this.scheduleSlotRepository.findByScheduleId(
      schedule.id,
    );
    if (slots.length === 0) {
      throw new ValidationError('No schedule slots found for this schedule');
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"

    let targetSlot = context.scheduleSlotId
      ? slots.find((s) => s.id === context.scheduleSlotId)
      : undefined;

    if (!targetSlot) {
      // Find slot by current time window
      targetSlot = slots.find(
        (s) => currentTime >= s.windowStart && currentTime <= s.windowEnd,
      );

      // If outside windows, pick the closest/next slot
      if (!targetSlot) {
        targetSlot = slots[0];
      }
    }

    if (!targetSlot) {
      throw new NotFoundError('Target schedule slot not found');
    }

    const existingLog =
      await this.attendanceLogRepository.findByMemberAndSlotAndDate(
        member.id,
        targetSlot.id,
        today,
      );
    if (existingLog && existingLog.checkedInAt) {
      throw new DuplicateError(
        `Attendance already recorded for slot "${targetSlot.label}" on ${today}`,
      );
    }

    // Determine status
    let status: 'present' | 'late' = 'present';
    if (currentTime > targetSlot.windowEnd) {
      status = 'late';
    }

    const logData = {
      companyMemberId: member.id,
      scheduleSlotId: targetSlot.id,
      workDate: today,
      checkedInAt: now,
      status,
      note: context.note ?? null,
      recordedBy: context.userId ?? null,
    };

    return this.attendanceLogRepository.upsertLog(logData);
  }
}

export class ManualCheckInAttendanceUseCase
  implements IManualCheckInAttendanceUseCase
{
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
  ) {}

  @RequirePermission('attendance:manage')
  async execute(
    context: IManualCheckInAttendanceContext,
  ): Promise<AttendanceLog> {
    const parsed = await createAttendanceLogSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance log data',
        parsed.error.format(),
      );
    }

    const payload = {
      ...parsed.data,
      recordedBy: parsed.data.recordedBy ?? context.userId ?? null,
    };

    return this.attendanceLogRepository.upsertLog(payload);
  }
}

export class GetAttendanceLogsByMemberUseCase
  implements IGetAttendanceLogsByMemberUseCase
{
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
  ) {}

  @RequirePermission('attendance:read')
  async execute(
    context: IGetAttendanceLogsByMemberContext,
  ): Promise<AttendanceLog[]> {
    if (context.startDate && context.endDate) {
      return this.attendanceLogRepository.findByMemberAndDateRange(
        context.companyMemberId,
        context.startDate,
        context.endDate,
      );
    }

    if (context.workDate) {
      return this.attendanceLogRepository.findByMemberAndDate(
        context.companyMemberId,
        context.workDate,
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    return this.attendanceLogRepository.findByMemberAndDate(
      context.companyMemberId,
      today,
    );
  }
}

export class GetAttendanceLogsByCompanyUseCase
  implements IGetAttendanceLogsByCompanyUseCase
{
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
  ) {}

  @RequirePermission('attendance:read')
  async execute(
    context: IGetAttendanceLogsByCompanyContext,
  ): Promise<AttendanceLog[]> {
    return this.attendanceLogRepository.findByCompanyAndDateRange(
      context.companyId,
      context.startDate,
      context.endDate,
    );
  }
}

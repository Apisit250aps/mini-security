import { attendanceClock, resolveAttendanceSlot } from './attendance-time';
import { PermissionGuard } from '../../lib/guard';
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
import type { IScheduleSlotLocationRepository } from '@repo/domains/repositories/location';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import { createAttendanceLogSchema } from '@repo/domains/schema/attendance';
import {
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class CheckInAttendanceUseCase implements ICheckInAttendanceUseCase {
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    private readonly checkInScheduleRepository: ICheckInScheduleRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly slotLocationRepository?: IScheduleSlotLocationRepository,
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

    PermissionGuard.requireCompanyScope(context, member.companyId);
    if (!member.isActive)
      throw new ValidationError('Company member is inactive');
    if (member.userId !== context.user?.id) {
      throw new ForbiddenError(
        'Use manual check-in to record attendance for another member',
      );
    }
    if (!context.scheduleSlotId)
      throw new ValidationError('Select a schedule slot');
    const schedules = await this.checkInScheduleRepository.findByRoleId(
      member.companyId,
      member.roleId,
    );
    const slot = await this.scheduleSlotRepository.findById(
      context.scheduleSlotId,
    );
    if (
      !slot ||
      !schedules.some(
        (schedule) =>
          schedule.id === slot.checkInScheduleId && schedule.isActive,
      )
    ) {
      throw new ValidationError(
        'Slot is not assigned to this member through an active schedule',
      );
    }

    const now = new Date();
    const {
      slot: targetSlot,
      workDate: today,
      status,
    } = resolveAttendanceSlot([slot], now, context.scheduleSlotId);

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

    // Geofencing verification if slot has assigned locations
    let locationSnapshot = {
      locationId: null as string | null,
      checkedInLatitude: null as number | null,
      checkedInLongitude: null as number | null,
      locationNameSnapshot: null as string | null,
      locationLatitudeSnapshot: null as number | null,
      locationLongitudeSnapshot: null as number | null,
      radiusMetersSnapshot: null as number | null,
    };

    if (this.slotLocationRepository) {
      const allowedLocations =
        await this.slotLocationRepository.findActiveLocationsBySlotId(
          targetSlot.id,
        );

      const assignments = await this.slotLocationRepository.findBySlotId(
        targetSlot.id,
      );
      if (assignments.length > 0 && allowedLocations.length === 0) {
        throw new ValidationError(
          'No active permitted location is available for this slot',
        );
      }
      if (allowedLocations.length > 0) {
        if (context.latitude == null || context.longitude == null) {
          throw new ValidationError(
            'GPS coordinates are required to check in for this slot',
          );
        }

        const userLat = context.latitude;
        const userLng = context.longitude;

        let matched = allowedLocations.find((loc) => {
          if (context.locationId && loc.id !== context.locationId) {
            return false;
          }
          const dist = calculateHaversineDistanceMeters(
            userLat,
            userLng,
            loc.latitude,
            loc.longitude,
          );
          return dist <= loc.radiusMeters;
        });

        if (!matched && !context.locationId) {
          // Check if within radius of any allowed location
          matched = allowedLocations.find((loc) => {
            const dist = calculateHaversineDistanceMeters(
              userLat,
              userLng,
              loc.latitude,
              loc.longitude,
            );
            return dist <= loc.radiusMeters;
          });
        }

        if (!matched) {
          throw new ValidationError(
            'You are outside the permitted geofence radius for this check-in slot',
          );
        }

        locationSnapshot = {
          locationId: matched.id,
          checkedInLatitude: userLat,
          checkedInLongitude: userLng,
          locationNameSnapshot: matched.name,
          locationLatitudeSnapshot: matched.latitude,
          locationLongitudeSnapshot: matched.longitude,
          radiusMetersSnapshot: matched.radiusMeters,
        };
      }
    }

    const logData = {
      companyId: member.companyId,
      companyMemberId: member.id,
      scheduleSlotId: targetSlot.id,
      workDate: today,
      checkedInAt: now,
      status,
      note: context.note ?? null,
      recordedBy: null,
      ...locationSnapshot,
    };

    return this.attendanceLogRepository.upsertLog(logData);
  }
}

export class ManualCheckInAttendanceUseCase
  implements IManualCheckInAttendanceUseCase
{
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
    private readonly scheduleSlotRepository: IScheduleSlotRepository,
    private readonly checkInScheduleRepository: ICheckInScheduleRepository,
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

    const member = await this.companyMemberRepository.findById(
      parsed.data.companyMemberId,
    );
    if (!member) throw new NotFoundError('Company member not found');
    PermissionGuard.requireCompanyScope(context, member.companyId);
    if (!member.isActive)
      throw new ValidationError('Company member is inactive');
    const [slot, schedules] = await Promise.all([
      this.scheduleSlotRepository.findById(parsed.data.scheduleSlotId),
      this.checkInScheduleRepository.findByRoleId(
        member.companyId,
        member.roleId,
      ),
    ]);
    if (
      !slot ||
      !schedules.some(
        (schedule) =>
          schedule.id === slot.checkInScheduleId && schedule.isActive,
      )
    ) {
      throw new ValidationError(
        'Slot is not assigned to this member through an active schedule',
      );
    }
    const payload = {
      ...parsed.data,
      recordedBy: context.user?.id ?? context.userId ?? null,
    };

    return this.attendanceLogRepository.upsertLog(payload);
  }
}

export class GetAttendanceLogsByMemberUseCase
  implements IGetAttendanceLogsByMemberUseCase
{
  constructor(
    private readonly attendanceLogRepository: IAttendanceLogRepository,
    private readonly companyMemberRepository: ICompanyMemberRepository,
  ) {}

  @RequirePermission('attendance:read')
  async execute(
    context: IGetAttendanceLogsByMemberContext,
  ): Promise<AttendanceLog[]> {
    const member = await this.companyMemberRepository.findById(
      context.companyMemberId,
    );
    if (!member) throw new NotFoundError('Company member not found');
    PermissionGuard.requireCompanyScope(context, member.companyId);
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

    const today = attendanceClock(new Date()).workDate;
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

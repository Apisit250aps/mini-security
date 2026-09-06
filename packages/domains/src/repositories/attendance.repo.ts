import type { BaseRepository } from '../index';
import type {
  AttendanceLog,
  CheckInSchedule,
  ScheduleSlot,
} from '#entities/attendance';
import type {
  CreateAttendanceLog,
  CreateCheckInSchedule,
  CreateScheduleSlot,
  UpdateAttendanceLog,
  UpdateCheckInSchedule,
  UpdateScheduleSlot,
} from '#schema/attendance';

export interface ICheckInScheduleRepository
  extends BaseRepository<
    CheckInSchedule,
    CreateCheckInSchedule,
    UpdateCheckInSchedule
  > {
  findByRoleId(roleId: string): Promise<CheckInSchedule | null>;
  findByCompanyId(companyId: string): Promise<CheckInSchedule[]>;
}

export interface IScheduleSlotRepository
  extends BaseRepository<ScheduleSlot, CreateScheduleSlot, UpdateScheduleSlot> {
  findByScheduleId(scheduleId: string): Promise<ScheduleSlot[]>;
  findByScheduleIdAndOrder(
    scheduleId: string,
    slotOrder: number,
  ): Promise<ScheduleSlot | null>;
  deleteByScheduleId(scheduleId: string): Promise<void>;
}

export interface IAttendanceLogRepository
  extends BaseRepository<
    AttendanceLog,
    CreateAttendanceLog,
    UpdateAttendanceLog
  > {
  findByMemberAndDate(
    memberId: string,
    workDate: string,
  ): Promise<AttendanceLog[]>;
  findByMemberAndSlotAndDate(
    memberId: string,
    slotId: string,
    workDate: string,
  ): Promise<AttendanceLog | null>;
  findByCompanyAndDateRange(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceLog[]>;
  findByMemberAndDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceLog[]>;
  upsertLog(data: CreateAttendanceLog): Promise<AttendanceLog>;
}

import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type {
  AttendanceLog,
  CheckInSchedule,
  ScheduleSlot,
} from '#entities/attendance';
import type {
  CreateAttendanceLog,
  CreateCheckInSchedule,
  CreateScheduleSlot,
  UpdateCheckInSchedule,
  UpdateScheduleSlot,
} from '#schema/attendance';

// ==========================================
// 1. Check-In Schedule Contexts & Use Cases
// ==========================================

export type ICreateCheckInScheduleContext = ISecurityContext & {
  data: CreateCheckInSchedule;
};

export type IUpdateCheckInScheduleContext = ISecurityContext & {
  id: string;
  data: UpdateCheckInSchedule;
};

export type IGetCheckInSchedulesByRoleContext = ISecurityContext & {
  companyId: string;
  roleId: string;
};

export type IGetCheckInSchedulesByCompanyContext = ISecurityContext & {
  companyId: string;
};

export type ICreateCheckInScheduleUseCase = BaseUseCase<
  ICreateCheckInScheduleContext,
  CheckInSchedule
>;

export type IUpdateCheckInScheduleUseCase = BaseUseCase<
  IUpdateCheckInScheduleContext,
  CheckInSchedule
>;

export type IGetCheckInSchedulesByRoleUseCase = BaseUseCase<
  IGetCheckInSchedulesByRoleContext,
  CheckInSchedule[]
>;

export type IGetCheckInSchedulesByCompanyUseCase = BaseUseCase<
  IGetCheckInSchedulesByCompanyContext,
  CheckInSchedule[]
>;

// ==========================================
// 2. Schedule Slot Contexts & Use Cases
// ==========================================

export type ICreateScheduleSlotContext = ISecurityContext & {
  data: CreateScheduleSlot;
};

export type IUpdateScheduleSlotContext = ISecurityContext & {
  id: string;
  data: UpdateScheduleSlot;
};

export type IDeleteScheduleSlotContext = ISecurityContext & {
  id: string;
};

export type IGetScheduleSlotsByScheduleContext = ISecurityContext & {
  checkInScheduleId: string;
};

export type ICreateScheduleSlotUseCase = BaseUseCase<
  ICreateScheduleSlotContext,
  ScheduleSlot
>;

export type IUpdateScheduleSlotUseCase = BaseUseCase<
  IUpdateScheduleSlotContext,
  ScheduleSlot
>;

export type IDeleteScheduleSlotUseCase = BaseUseCase<
  IDeleteScheduleSlotContext,
  void
>;

export type IGetScheduleSlotsByScheduleUseCase = BaseUseCase<
  IGetScheduleSlotsByScheduleContext,
  ScheduleSlot[]
>;

// ==========================================
// 3. Attendance Log Contexts & Use Cases
// ==========================================

export type ICheckInAttendanceContext = ISecurityContext & {
  companyMemberId: string;
  scheduleSlotId: string;
  note?: string;
};

export type IManualCheckInAttendanceContext = ISecurityContext & {
  data: CreateAttendanceLog;
};

export type IGetAttendanceLogsByMemberContext = ISecurityContext & {
  companyMemberId: string;
  workDate?: string;
  startDate?: string;
  endDate?: string;
};

export type IGetAttendanceLogsByCompanyContext = ISecurityContext & {
  companyId: string;
  startDate: string;
  endDate: string;
};

export type ICheckInAttendanceUseCase = BaseUseCase<
  ICheckInAttendanceContext,
  AttendanceLog
>;

export type IManualCheckInAttendanceUseCase = BaseUseCase<
  IManualCheckInAttendanceContext,
  AttendanceLog
>;

export type IGetAttendanceLogsByMemberUseCase = BaseUseCase<
  IGetAttendanceLogsByMemberContext,
  AttendanceLog[]
>;

export type IGetAttendanceLogsByCompanyUseCase = BaseUseCase<
  IGetAttendanceLogsByCompanyContext,
  AttendanceLog[]
>;

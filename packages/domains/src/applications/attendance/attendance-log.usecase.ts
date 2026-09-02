import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { AttendanceLog } from '#entities/attendance';
import type {
  CreateAttendanceLog,
  UpdateAttendanceLog,
} from '#schema/attendance';

// Attendance Log Contexts
export type ICreateAttendanceLogContext = ISecurityContext & {
  data: CreateAttendanceLog;
};
export type IUpdateAttendanceLogContext = ISecurityContext & {
  id: string;
  data: UpdateAttendanceLog;
};
export type IDeleteAttendanceLogContext = ISecurityContext & { id: string };
export type IGetAttendanceLogContext = ISecurityContext & { id: string };
export type IGetAttendanceLogsByRecordContext = ISecurityContext & {
  attendanceRecordId: string;
};

// Attendance Log Contracts
export type ICreateAttendanceLogUseCase = BaseUseCase<
  ICreateAttendanceLogContext,
  AttendanceLog
>;
export type IUpdateAttendanceLogUseCase = BaseUseCase<
  IUpdateAttendanceLogContext,
  AttendanceLog
>;
export type IDeleteAttendanceLogUseCase = BaseUseCase<
  IDeleteAttendanceLogContext,
  void
>;
export type IGetAttendanceLogUseCase = BaseUseCase<
  IGetAttendanceLogContext,
  AttendanceLog | null
>;
export type IGetAttendanceLogsByRecordUseCase = BaseUseCase<
  IGetAttendanceLogsByRecordContext,
  AttendanceLog[]
>;

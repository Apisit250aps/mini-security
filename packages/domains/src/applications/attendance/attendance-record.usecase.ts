import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { AttendanceRecord } from '#entities/attendance';
import type {
  AttendanceStatus,
  CreateAttendanceRecord,
  UpdateAttendanceRecord,
} from '#schema/attendance';

// Attendance Record Contexts
export type ICreateAttendanceRecordContext = ISecurityContext & {
  data: CreateAttendanceRecord;
};
export type IUpdateAttendanceRecordContext = ISecurityContext & {
  id: string;
  data: UpdateAttendanceRecord;
};
export type IDeleteAttendanceRecordContext = ISecurityContext & { id: string };
export type IGetAttendanceRecordContext = ISecurityContext & { id: string };
export type IGetAttendanceRecordsContext = ISecurityContext & {
  companyId: string;
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
};
export type IGetMemberAttendanceRecordByDateContext = ISecurityContext & {
  companyMemberId: string;
  workDate: Date;
};
export type IApproveAttendanceRecordContext = ISecurityContext & {
  id: string;
  approvedBy: string;
  status: AttendanceStatus;
  note?: string;
};

// Attendance Record Contracts
export type ICreateAttendanceRecordUseCase = BaseUseCase<
  ICreateAttendanceRecordContext,
  AttendanceRecord
>;
export type IUpdateAttendanceRecordUseCase = BaseUseCase<
  IUpdateAttendanceRecordContext,
  AttendanceRecord
>;
export type IDeleteAttendanceRecordUseCase = BaseUseCase<
  IDeleteAttendanceRecordContext,
  void
>;
export type IGetAttendanceRecordUseCase = BaseUseCase<
  IGetAttendanceRecordContext,
  AttendanceRecord | null
>;
export type IGetAttendanceRecordsUseCase = BaseUseCase<
  IGetAttendanceRecordsContext,
  AttendanceRecord[]
>;
export type IGetMemberAttendanceRecordByDateUseCase = BaseUseCase<
  IGetMemberAttendanceRecordByDateContext,
  AttendanceRecord | null
>;
export type IApproveAttendanceRecordUseCase = BaseUseCase<
  IApproveAttendanceRecordContext,
  AttendanceRecord
>;

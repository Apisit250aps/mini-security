import {
  ApproveAttendanceRecordUseCase,
  CreateAttendanceRecordUseCase,
  DeleteAttendanceRecordUseCase,
  GetAttendanceRecordUseCase,
  GetAttendanceRecordsUseCase,
  GetMemberAttendanceRecordByDateUseCase,
  UpdateAttendanceRecordUseCase,
} from '@repo/applications';
import {
  attendanceRecordRepository,
  companyMemberRepository,
  workShiftRepository,
} from '../../repositories';

export const createAttendanceRecordUseCase = new CreateAttendanceRecordUseCase(
  attendanceRecordRepository,
  companyMemberRepository,
  workShiftRepository,
);
export const updateAttendanceRecordUseCase = new UpdateAttendanceRecordUseCase(
  attendanceRecordRepository,
);
export const deleteAttendanceRecordUseCase = new DeleteAttendanceRecordUseCase(
  attendanceRecordRepository,
);
export const getAttendanceRecordUseCase = new GetAttendanceRecordUseCase(
  attendanceRecordRepository,
);
export const getAttendanceRecordsUseCase = new GetAttendanceRecordsUseCase(
  attendanceRecordRepository,
);
export const getMemberAttendanceRecordByDateUseCase =
  new GetMemberAttendanceRecordByDateUseCase(attendanceRecordRepository);
export const approveAttendanceRecordUseCase =
  new ApproveAttendanceRecordUseCase(attendanceRecordRepository);

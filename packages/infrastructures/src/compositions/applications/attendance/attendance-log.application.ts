import {
  CreateAttendanceLogUseCase,
  DeleteAttendanceLogUseCase,
  GetAttendanceLogUseCase,
  GetAttendanceLogsByRecordUseCase,
  UpdateAttendanceLogUseCase,
} from '@repo/applications';
import {
  attendanceCheckpointRepository,
  attendanceLogRepository,
  attendanceRecordRepository,
} from '../../repositories';

export const createAttendanceLogUseCase = new CreateAttendanceLogUseCase(
  attendanceLogRepository,
  attendanceRecordRepository,
  attendanceCheckpointRepository,
);
export const updateAttendanceLogUseCase = new UpdateAttendanceLogUseCase(
  attendanceLogRepository,
);
export const deleteAttendanceLogUseCase = new DeleteAttendanceLogUseCase(
  attendanceLogRepository,
);
export const getAttendanceLogUseCase = new GetAttendanceLogUseCase(
  attendanceLogRepository,
);
export const getAttendanceLogsByRecordUseCase =
  new GetAttendanceLogsByRecordUseCase(attendanceLogRepository);

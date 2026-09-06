import {
  CheckInAttendanceUseCase,
  CreateCheckInScheduleUseCase,
  CreateScheduleSlotUseCase,
  DeleteScheduleSlotUseCase,
  GetAttendanceLogsByCompanyUseCase,
  GetAttendanceLogsByMemberUseCase,
  GetCheckInScheduleByRoleUseCase,
  GetCheckInSchedulesByCompanyUseCase,
  GetScheduleSlotsByScheduleUseCase,
  ManualCheckInAttendanceUseCase,
  UpdateCheckInScheduleUseCase,
  UpdateScheduleSlotUseCase,
} from '@repo/applications';
import {
  attendanceLogRepository,
  checkInScheduleRepository,
  companyMemberRepository,
  scheduleSlotRepository,
} from '../../repositories';

export const createCheckInScheduleUseCase = new CreateCheckInScheduleUseCase(
  checkInScheduleRepository,
);

export const updateCheckInScheduleUseCase = new UpdateCheckInScheduleUseCase(
  checkInScheduleRepository,
);

export const getCheckInScheduleByRoleUseCase =
  new GetCheckInScheduleByRoleUseCase(checkInScheduleRepository);

export const getCheckInSchedulesByCompanyUseCase =
  new GetCheckInSchedulesByCompanyUseCase(checkInScheduleRepository);

export const createScheduleSlotUseCase = new CreateScheduleSlotUseCase(
  scheduleSlotRepository,
  checkInScheduleRepository,
);

export const updateScheduleSlotUseCase = new UpdateScheduleSlotUseCase(
  scheduleSlotRepository,
);

export const deleteScheduleSlotUseCase = new DeleteScheduleSlotUseCase(
  scheduleSlotRepository,
);

export const getScheduleSlotsByScheduleUseCase =
  new GetScheduleSlotsByScheduleUseCase(scheduleSlotRepository);

export const checkInAttendanceUseCase = new CheckInAttendanceUseCase(
  attendanceLogRepository,
  scheduleSlotRepository,
  checkInScheduleRepository,
  companyMemberRepository,
);

export const manualCheckInAttendanceUseCase =
  new ManualCheckInAttendanceUseCase(attendanceLogRepository);

export const getAttendanceLogsByMemberUseCase =
  new GetAttendanceLogsByMemberUseCase(attendanceLogRepository);

export const getAttendanceLogsByCompanyUseCase =
  new GetAttendanceLogsByCompanyUseCase(attendanceLogRepository);

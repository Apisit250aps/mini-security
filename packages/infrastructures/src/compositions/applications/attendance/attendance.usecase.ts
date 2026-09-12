import {
  CheckInAttendanceUseCase,
  CreateCheckInScheduleUseCase,
  CreateScheduleSlotUseCase,
  DeleteScheduleSlotUseCase,
  GetAttendanceLogsByCompanyUseCase,
  GetAttendanceLogsByMemberUseCase,
  GetCheckInSchedulesByRoleUseCase,
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
  roleRepository,
  scheduleSlotRepository,
} from '../../repositories';

export const createCheckInScheduleUseCase = new CreateCheckInScheduleUseCase(
  checkInScheduleRepository,
  roleRepository,
);

export const updateCheckInScheduleUseCase = new UpdateCheckInScheduleUseCase(
  checkInScheduleRepository,
  roleRepository,
);

export const getCheckInSchedulesByRoleUseCase =
  new GetCheckInSchedulesByRoleUseCase(checkInScheduleRepository);

export const getCheckInSchedulesByCompanyUseCase =
  new GetCheckInSchedulesByCompanyUseCase(checkInScheduleRepository);

export const createScheduleSlotUseCase = new CreateScheduleSlotUseCase(
  scheduleSlotRepository,
  checkInScheduleRepository,
);

export const updateScheduleSlotUseCase = new UpdateScheduleSlotUseCase(
  scheduleSlotRepository,
  checkInScheduleRepository,
);

export const deleteScheduleSlotUseCase = new DeleteScheduleSlotUseCase(
  scheduleSlotRepository,
  checkInScheduleRepository,
);

export const getScheduleSlotsByScheduleUseCase =
  new GetScheduleSlotsByScheduleUseCase(
    scheduleSlotRepository,
    checkInScheduleRepository,
  );

export const checkInAttendanceUseCase = new CheckInAttendanceUseCase(
  attendanceLogRepository,
  scheduleSlotRepository,
  checkInScheduleRepository,
  companyMemberRepository,
);

export const manualCheckInAttendanceUseCase =
  new ManualCheckInAttendanceUseCase(
    attendanceLogRepository,
    companyMemberRepository,
    scheduleSlotRepository,
    checkInScheduleRepository,
  );

export const getAttendanceLogsByMemberUseCase =
  new GetAttendanceLogsByMemberUseCase(
    attendanceLogRepository,
    companyMemberRepository,
  );

export const getAttendanceLogsByCompanyUseCase =
  new GetAttendanceLogsByCompanyUseCase(attendanceLogRepository);

import {
  CheckInAttendanceUseCase,
  CreateCheckInScheduleUseCase,
  CreateScheduleSlotUseCase,
  DeleteScheduleSlotUseCase,
  GetAttendanceLogsByOrganizationUseCase,
  GetAttendanceLogsByMemberUseCase,
  GetCheckInSchedulesByRoleUseCase,
  GetCheckInSchedulesByOrganizationUseCase,
  GetScheduleSlotsByScheduleUseCase,
  ManualCheckInAttendanceUseCase,
  UpdateCheckInScheduleUseCase,
  UpdateScheduleSlotUseCase,
} from '@repo/applications';
import {
  attendanceLogRepository,
  checkInScheduleRepository,
  organizationMemberRepository,
  roleRepository,
  scheduleSlotLocationRepository,
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

export const getCheckInSchedulesByOrganizationUseCase =
  new GetCheckInSchedulesByOrganizationUseCase(checkInScheduleRepository);

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
  organizationMemberRepository,
  scheduleSlotLocationRepository,
);

export const manualCheckInAttendanceUseCase =
  new ManualCheckInAttendanceUseCase(
    attendanceLogRepository,
    organizationMemberRepository,
    scheduleSlotRepository,
    checkInScheduleRepository,
  );

export const getAttendanceLogsByMemberUseCase =
  new GetAttendanceLogsByMemberUseCase(
    attendanceLogRepository,
    organizationMemberRepository,
  );

export const getAttendanceLogsByOrganizationUseCase =
  new GetAttendanceLogsByOrganizationUseCase(attendanceLogRepository);

import {
  CancelLeaveRequestUseCase,
  CreateLeaveQuotaUseCase,
  CreateLeaveTypeUseCase,
  GetLeaveQuotasByMemberUseCase,
  GetLeaveRequestsByCompanyUseCase,
  GetLeaveRequestsByMemberUseCase,
  GetLeaveTypesByCompanyUseCase,
  ReviewLeaveRequestUseCase,
  SubmitLeaveRequestUseCase,
  UpdateLeaveQuotaUseCase,
  UpdateLeaveTypeUseCase,
} from '@repo/applications';
import {
  attendanceLogRepository,
  checkInScheduleRepository,
  companyMemberRepository,
  leaveQuotaRepository,
  leaveRequestRepository,
  leaveTypeRepository,
  scheduleSlotRepository,
} from '../../repositories';

export const createLeaveTypeUseCase = new CreateLeaveTypeUseCase(
  leaveTypeRepository,
);

export const updateLeaveTypeUseCase = new UpdateLeaveTypeUseCase(
  leaveTypeRepository,
);

export const getLeaveTypesByCompanyUseCase = new GetLeaveTypesByCompanyUseCase(
  leaveTypeRepository,
);

export const createLeaveQuotaUseCase = new CreateLeaveQuotaUseCase(
  leaveQuotaRepository,
);

export const updateLeaveQuotaUseCase = new UpdateLeaveQuotaUseCase(
  leaveQuotaRepository,
);

export const getLeaveQuotasByMemberUseCase = new GetLeaveQuotasByMemberUseCase(
  leaveQuotaRepository,
);

export const submitLeaveRequestUseCase = new SubmitLeaveRequestUseCase(
  leaveRequestRepository,
  leaveQuotaRepository,
);

export const reviewLeaveRequestUseCase = new ReviewLeaveRequestUseCase(
  leaveRequestRepository,
  leaveQuotaRepository,
  leaveTypeRepository,
  companyMemberRepository,
  checkInScheduleRepository,
  scheduleSlotRepository,
  attendanceLogRepository,
);

export const cancelLeaveRequestUseCase = new CancelLeaveRequestUseCase(
  leaveRequestRepository,
  leaveQuotaRepository,
);

export const getLeaveRequestsByMemberUseCase =
  new GetLeaveRequestsByMemberUseCase(leaveRequestRepository);

export const getLeaveRequestsByCompanyUseCase =
  new GetLeaveRequestsByCompanyUseCase(leaveRequestRepository);

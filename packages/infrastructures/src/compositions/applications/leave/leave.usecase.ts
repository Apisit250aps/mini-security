import { unitOfWork } from '../../unit-of-work';
import {
  CancelLeaveRequestUseCase,
  CreateLeaveQuotaUseCase,
  CreateLeaveTypeUseCase,
  GetLeaveQuotasByMemberUseCase,
  GetLeaveRequestsByOrganizationUseCase,
  GetLeaveRequestsByMemberUseCase,
  GetLeaveTypesByOrganizationUseCase,
  ReviewLeaveRequestUseCase,
  SubmitLeaveRequestUseCase,
  UpdateLeaveQuotaUseCase,
  UpdateLeaveTypeUseCase,
} from '@repo/applications';
import {
  attendanceLogRepository,
  checkInScheduleRepository,
  organizationMemberRepository,
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

export const getLeaveTypesByOrganizationUseCase =
  new GetLeaveTypesByOrganizationUseCase(leaveTypeRepository);

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
  unitOfWork,
  leaveRequestRepository,
  leaveQuotaRepository,
  leaveTypeRepository,
  organizationMemberRepository,
  checkInScheduleRepository,
  scheduleSlotRepository,
  attendanceLogRepository,
);

export const cancelLeaveRequestUseCase = new CancelLeaveRequestUseCase(
  unitOfWork,
  leaveRequestRepository,
);

export const getLeaveRequestsByMemberUseCase =
  new GetLeaveRequestsByMemberUseCase(leaveRequestRepository);

export const getLeaveRequestsByOrganizationUseCase =
  new GetLeaveRequestsByOrganizationUseCase(leaveRequestRepository);

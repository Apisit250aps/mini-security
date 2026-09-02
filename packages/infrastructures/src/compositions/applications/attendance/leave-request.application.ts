import {
  CreateLeaveRequestUseCase,
  DeleteLeaveRequestUseCase,
  GetLeaveRequestUseCase,
  GetLeaveRequestsUseCase,
  ReviewLeaveRequestUseCase,
  UpdateLeaveRequestUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  leaveRequestRepository,
} from '../../repositories';

export const createLeaveRequestUseCase = new CreateLeaveRequestUseCase(
  leaveRequestRepository,
  companyMemberRepository,
);
export const updateLeaveRequestUseCase = new UpdateLeaveRequestUseCase(
  leaveRequestRepository,
);
export const deleteLeaveRequestUseCase = new DeleteLeaveRequestUseCase(
  leaveRequestRepository,
);
export const getLeaveRequestUseCase = new GetLeaveRequestUseCase(
  leaveRequestRepository,
);
export const getLeaveRequestsUseCase = new GetLeaveRequestsUseCase(
  leaveRequestRepository,
);
export const reviewLeaveRequestUseCase = new ReviewLeaveRequestUseCase(
  leaveRequestRepository,
);

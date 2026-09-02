import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { LeaveRequest } from '#entities/attendance';
import type {
  CreateLeaveRequest,
  LeaveStatus,
  UpdateLeaveRequest,
} from '#schema/attendance';

// Leave Request Contexts
export type ICreateLeaveRequestContext = ISecurityContext & {
  data: CreateLeaveRequest;
};
export type IUpdateLeaveRequestContext = ISecurityContext & {
  id: string;
  data: UpdateLeaveRequest;
};
export type IDeleteLeaveRequestContext = ISecurityContext & { id: string };
export type IGetLeaveRequestContext = ISecurityContext & { id: string };
export type IGetLeaveRequestsContext = ISecurityContext & {
  companyId: string;
  memberId?: string;
  status?: string;
};
export type IReviewLeaveRequestContext = ISecurityContext & {
  id: string;
  reviewedBy: string;
  status: LeaveStatus;
  reviewNote?: string;
};

// Leave Request Contracts
export type ICreateLeaveRequestUseCase = BaseUseCase<
  ICreateLeaveRequestContext,
  LeaveRequest
>;
export type IUpdateLeaveRequestUseCase = BaseUseCase<
  IUpdateLeaveRequestContext,
  LeaveRequest
>;
export type IDeleteLeaveRequestUseCase = BaseUseCase<
  IDeleteLeaveRequestContext,
  void
>;
export type IGetLeaveRequestUseCase = BaseUseCase<
  IGetLeaveRequestContext,
  LeaveRequest | null
>;
export type IGetLeaveRequestsUseCase = BaseUseCase<
  IGetLeaveRequestsContext,
  LeaveRequest[]
>;
export type IReviewLeaveRequestUseCase = BaseUseCase<
  IReviewLeaveRequestContext,
  LeaveRequest
>;

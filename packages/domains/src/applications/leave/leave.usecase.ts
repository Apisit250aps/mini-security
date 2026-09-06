import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { LeaveQuota, LeaveRequest, LeaveType } from '#entities/leave';
import type {
  CreateLeaveQuota,
  CreateLeaveRequest,
  CreateLeaveType,
  UpdateLeaveQuota,
  UpdateLeaveType,
} from '#schema/leave';

// ==========================================
// 1. Leave Type Contexts & Use Cases
// ==========================================

export type ICreateLeaveTypeContext = ISecurityContext & {
  data: CreateLeaveType;
};

export type IUpdateLeaveTypeContext = ISecurityContext & {
  id: string;
  data: UpdateLeaveType;
};

export type IGetLeaveTypesByCompanyContext = ISecurityContext & {
  companyId: string;
  onlyActive?: boolean;
};

export type ICreateLeaveTypeUseCase = BaseUseCase<
  ICreateLeaveTypeContext,
  LeaveType
>;

export type IUpdateLeaveTypeUseCase = BaseUseCase<
  IUpdateLeaveTypeContext,
  LeaveType
>;

export type IGetLeaveTypesByCompanyUseCase = BaseUseCase<
  IGetLeaveTypesByCompanyContext,
  LeaveType[]
>;

// ==========================================
// 2. Leave Quota Contexts & Use Cases
// ==========================================

export type ICreateLeaveQuotaContext = ISecurityContext & {
  data: CreateLeaveQuota;
};

export type IUpdateLeaveQuotaContext = ISecurityContext & {
  id: string;
  data: UpdateLeaveQuota;
};

export type IGetLeaveQuotasByMemberContext = ISecurityContext & {
  companyMemberId: string;
  year: number;
};

export type ICreateLeaveQuotaUseCase = BaseUseCase<
  ICreateLeaveQuotaContext,
  LeaveQuota
>;

export type IUpdateLeaveQuotaUseCase = BaseUseCase<
  IUpdateLeaveQuotaContext,
  LeaveQuota
>;

export type IGetLeaveQuotasByMemberUseCase = BaseUseCase<
  IGetLeaveQuotasByMemberContext,
  LeaveQuota[]
>;

// ==========================================
// 3. Leave Request Contexts & Use Cases
// ==========================================

export type ISubmitLeaveRequestContext = ISecurityContext & {
  data: CreateLeaveRequest;
};

export type IReviewLeaveRequestContext = ISecurityContext & {
  id: string;
  action: 'approved' | 'rejected';
  reviewNote?: string;
};

export type ICancelLeaveRequestContext = ISecurityContext & {
  id: string;
};

export type IGetLeaveRequestsByMemberContext = ISecurityContext & {
  companyMemberId: string;
};

export type IGetLeaveRequestsByCompanyContext = ISecurityContext & {
  companyId: string;
  status?: string;
};

export type ISubmitLeaveRequestUseCase = BaseUseCase<
  ISubmitLeaveRequestContext,
  LeaveRequest
>;

export type IReviewLeaveRequestUseCase = BaseUseCase<
  IReviewLeaveRequestContext,
  LeaveRequest
>;

export type ICancelLeaveRequestUseCase = BaseUseCase<
  ICancelLeaveRequestContext,
  LeaveRequest
>;

export type IGetLeaveRequestsByMemberUseCase = BaseUseCase<
  IGetLeaveRequestsByMemberContext,
  LeaveRequest[]
>;

export type IGetLeaveRequestsByCompanyUseCase = BaseUseCase<
  IGetLeaveRequestsByCompanyContext,
  LeaveRequest[]
>;

import type { BaseRepository } from '../index';
import type { LeaveQuota, LeaveRequest, LeaveType } from '#entities/leave';
import type {
  CreateLeaveQuota,
  CreateLeaveRequest,
  CreateLeaveType,
  UpdateLeaveQuota,
  UpdateLeaveRequest,
  UpdateLeaveType,
} from '#schema/leave';

export interface ILeaveTypeRepository
  extends BaseRepository<LeaveType, CreateLeaveType, UpdateLeaveType> {
  findByCompanyId(companyId: string): Promise<LeaveType[]>;
  findActiveByCompanyId(companyId: string): Promise<LeaveType[]>;
  findByNameAndCompany(
    companyId: string,
    name: string,
  ): Promise<LeaveType | null>;
}

export interface ILeaveQuotaRepository
  extends BaseRepository<LeaveQuota, CreateLeaveQuota, UpdateLeaveQuota> {
  findByMemberAndYear(memberId: string, year: number): Promise<LeaveQuota[]>;
  findByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveQuota | null>;
  lockByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveQuota | null>;
}

export interface ILeaveRequestRepository
  extends BaseRepository<LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest> {
  findByMemberId(memberId: string): Promise<LeaveRequest[]>;
  findByCompanyId(companyId: string, status?: string): Promise<LeaveRequest[]>;
  findByMemberAndDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
  ): Promise<LeaveRequest[]>;
  findApprovedByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveRequest[]>;
}


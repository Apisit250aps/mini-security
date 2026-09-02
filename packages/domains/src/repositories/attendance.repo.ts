import type { BaseRepository } from '../index';
import type {
  AttendanceCheckpoint,
  AttendanceLocation,
  AttendanceLog,
  AttendancePolicy,
  AttendanceRecord,
  CheckpointLocation,
  LeaveRequest,
  RoleAttendancePolicy,
  RoleWorkSchedule,
  WorkSchedule,
  WorkShift,
} from '#entities/attendance';
import type {
  CreateAttendanceCheckpoint,
  CreateAttendanceLocation,
  CreateAttendanceLog,
  CreateAttendancePolicy,
  CreateAttendanceRecord,
  CreateCheckpointLocation,
  CreateLeaveRequest,
  CreateRoleAttendancePolicy,
  CreateRoleWorkSchedule,
  CreateWorkSchedule,
  CreateWorkShift,
  UpdateAttendanceCheckpoint,
  UpdateAttendanceLocation,
  UpdateAttendanceLog,
  UpdateAttendancePolicy,
  UpdateAttendanceRecord,
  UpdateCheckpointLocation,
  UpdateLeaveRequest,
  UpdateRoleAttendancePolicy,
  UpdateRoleWorkSchedule,
  UpdateWorkSchedule,
  UpdateWorkShift,
} from '#schema/attendance';

export interface IWorkScheduleRepository
  extends BaseRepository<WorkSchedule, CreateWorkSchedule, UpdateWorkSchedule> {
  findByCompanyId(companyId: string): Promise<WorkSchedule[]>;
  findActiveByCompanyId(companyId: string): Promise<WorkSchedule[]>;
}

export interface IWorkShiftRepository
  extends BaseRepository<WorkShift, CreateWorkShift, UpdateWorkShift> {
  findByWorkScheduleId(workScheduleId: string): Promise<WorkShift[]>;
  findByCompanyId(companyId: string): Promise<WorkShift[]>;
}

export interface IAttendancePolicyRepository
  extends BaseRepository<
    AttendancePolicy,
    CreateAttendancePolicy,
    UpdateAttendancePolicy
  > {
  findByCompanyId(companyId: string): Promise<AttendancePolicy[]>;
  findActiveByCompanyId(companyId: string): Promise<AttendancePolicy[]>;
}

export interface IAttendanceCheckpointRepository
  extends BaseRepository<
    AttendanceCheckpoint,
    CreateAttendanceCheckpoint,
    UpdateAttendanceCheckpoint
  > {
  findByPolicyId(policyId: string): Promise<AttendanceCheckpoint[]>;
}

export interface IRoleAttendancePolicyRepository
  extends BaseRepository<
    RoleAttendancePolicy,
    CreateRoleAttendancePolicy,
    UpdateRoleAttendancePolicy
  > {
  findByRoleId(roleId: string): Promise<RoleAttendancePolicy[]>;
  findByPolicyId(policyId: string): Promise<RoleAttendancePolicy[]>;
  findByCompanyId(companyId: string): Promise<RoleAttendancePolicy[]>;
  findByRoleAndPolicy(
    roleId: string,
    policyId: string,
  ): Promise<RoleAttendancePolicy | null>;
  deleteByRoleAndPolicy(roleId: string, policyId: string): Promise<void>;
}

export interface IAttendanceLocationRepository
  extends BaseRepository<
    AttendanceLocation,
    CreateAttendanceLocation,
    UpdateAttendanceLocation
  > {
  findByCompanyId(companyId: string): Promise<AttendanceLocation[]>;
  findByBranchId(branchId: string): Promise<AttendanceLocation[]>;
}

export interface ICheckpointLocationRepository
  extends BaseRepository<
    CheckpointLocation,
    CreateCheckpointLocation,
    UpdateCheckpointLocation
  > {
  findByCheckpointId(checkpointId: string): Promise<CheckpointLocation[]>;
  findByLocationId(locationId: string): Promise<CheckpointLocation[]>;
  deleteByCheckpointAndLocation(
    checkpointId: string,
    locationId: string,
  ): Promise<void>;
}

export interface IRoleWorkScheduleRepository
  extends BaseRepository<
    RoleWorkSchedule,
    CreateRoleWorkSchedule,
    UpdateRoleWorkSchedule
  > {
  findByRoleId(roleId: string): Promise<RoleWorkSchedule[]>;
  findByCompanyId(companyId: string): Promise<RoleWorkSchedule[]>;
  findCurrentByRoleId(
    roleId: string,
    date: Date,
  ): Promise<RoleWorkSchedule | null>;
}

export interface IAttendanceRecordRepository
  extends BaseRepository<
    AttendanceRecord,
    CreateAttendanceRecord,
    UpdateAttendanceRecord
  > {
  findByCompanyId(companyId: string): Promise<AttendanceRecord[]>;
  findByMemberId(companyMemberId: string): Promise<AttendanceRecord[]>;
  findByMemberAndDate(
    companyMemberId: string,
    workDate: Date,
  ): Promise<AttendanceRecord | null>;
  findByCompanyAndDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceRecord[]>;
}

export interface IAttendanceLogRepository
  extends BaseRepository<
    AttendanceLog,
    CreateAttendanceLog,
    UpdateAttendanceLog
  > {
  findByRecordId(attendanceRecordId: string): Promise<AttendanceLog[]>;
  findByRecordAndCheckpoint(
    attendanceRecordId: string,
    checkpointId: string,
  ): Promise<AttendanceLog | null>;
}

export interface ILeaveRequestRepository
  extends BaseRepository<LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest> {
  findByCompanyId(companyId: string): Promise<LeaveRequest[]>;
  findByMemberId(companyMemberId: string): Promise<LeaveRequest[]>;
  findByStatus(companyId: string, status: string): Promise<LeaveRequest[]>;
}

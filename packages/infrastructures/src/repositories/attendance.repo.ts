import { and, eq, gte, isNull, lte, or } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  attendanceCheckpoint,
  attendanceLocation,
  attendanceLog,
  attendancePolicy,
  attendanceRecord,
  checkpointLocation,
  leaveRequest,
  roleAttendancePolicy,
  roleWorkSchedule,
  workSchedule,
  workShift,
} from '@repo/database/schema';
import {
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
} from '@repo/domains/entities';
import type {
  IAttendanceCheckpointRepository,
  IAttendanceLocationRepository,
  IAttendanceLogRepository,
  IAttendancePolicyRepository,
  IAttendanceRecordRepository,
  ICheckpointLocationRepository,
  ILeaveRequestRepository,
  IRoleAttendancePolicyRepository,
  IRoleWorkScheduleRepository,
  IWorkScheduleRepository,
  IWorkShiftRepository,
} from '@repo/domains/repositories/attendance';
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
  LeaveStatus,
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
} from '@repo/domains/schema/attendance';

export class WorkScheduleRepository
  extends Repository<WorkSchedule, CreateWorkSchedule, UpdateWorkSchedule>
  implements IWorkScheduleRepository
{
  constructor(db: Database) {
    super(db, workSchedule);
  }

  async findByCompanyId(companyId: string): Promise<WorkSchedule[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(workSchedule.companyId, companyId));
    return results.map((r) => new WorkSchedule(r as unknown as WorkSchedule));
  }

  async findActiveByCompanyId(companyId: string): Promise<WorkSchedule[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(workSchedule.companyId, companyId),
          eq(workSchedule.isActive, true),
        ),
      );
    return results.map((r) => new WorkSchedule(r as unknown as WorkSchedule));
  }
}

export class WorkShiftRepository
  extends Repository<WorkShift, CreateWorkShift, UpdateWorkShift>
  implements IWorkShiftRepository
{
  constructor(db: Database) {
    super(db, workShift);
  }

  async findByWorkScheduleId(workScheduleId: string): Promise<WorkShift[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(workShift.workScheduleId, workScheduleId));
    return results.map((r) => new WorkShift(r as unknown as WorkShift));
  }

  async findByCompanyId(companyId: string): Promise<WorkShift[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(workShift.companyId, companyId));
    return results.map((r) => new WorkShift(r as unknown as WorkShift));
  }
}

export class AttendancePolicyRepository
  extends Repository<
    AttendancePolicy,
    CreateAttendancePolicy,
    UpdateAttendancePolicy
  >
  implements IAttendancePolicyRepository
{
  constructor(db: Database) {
    super(db, attendancePolicy);
  }

  async findByCompanyId(companyId: string): Promise<AttendancePolicy[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendancePolicy.companyId, companyId));
    return results.map(
      (r) => new AttendancePolicy(r as unknown as AttendancePolicy),
    );
  }

  async findActiveByCompanyId(companyId: string): Promise<AttendancePolicy[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(attendancePolicy.companyId, companyId),
          eq(attendancePolicy.isActive, true),
        ),
      );
    return results.map(
      (r) => new AttendancePolicy(r as unknown as AttendancePolicy),
    );
  }
}

export class AttendanceCheckpointRepository
  extends Repository<
    AttendanceCheckpoint,
    CreateAttendanceCheckpoint,
    UpdateAttendanceCheckpoint
  >
  implements IAttendanceCheckpointRepository
{
  constructor(db: Database) {
    super(db, attendanceCheckpoint);
  }

  async findByPolicyId(policyId: string): Promise<AttendanceCheckpoint[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceCheckpoint.policyId, policyId));
    return results.map(
      (r) => new AttendanceCheckpoint(r as unknown as AttendanceCheckpoint),
    );
  }
}

export class RoleAttendancePolicyRepository
  extends Repository<
    RoleAttendancePolicy,
    CreateRoleAttendancePolicy,
    UpdateRoleAttendancePolicy
  >
  implements IRoleAttendancePolicyRepository
{
  constructor(db: Database) {
    super(db, roleAttendancePolicy);
  }

  async findByRoleId(roleId: string): Promise<RoleAttendancePolicy[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleAttendancePolicy.roleId, roleId));
    return results.map(
      (r) => new RoleAttendancePolicy(r as unknown as RoleAttendancePolicy),
    );
  }

  async findByPolicyId(policyId: string): Promise<RoleAttendancePolicy[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleAttendancePolicy.policyId, policyId));
    return results.map(
      (r) => new RoleAttendancePolicy(r as unknown as RoleAttendancePolicy),
    );
  }

  async findByCompanyId(companyId: string): Promise<RoleAttendancePolicy[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleAttendancePolicy.companyId, companyId));
    return results.map(
      (r) => new RoleAttendancePolicy(r as unknown as RoleAttendancePolicy),
    );
  }

  async findByRoleAndPolicy(
    roleId: string,
    policyId: string,
  ): Promise<RoleAttendancePolicy | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(roleAttendancePolicy.roleId, roleId),
          eq(roleAttendancePolicy.policyId, policyId),
        ),
      );
    return result
      ? new RoleAttendancePolicy(result as unknown as RoleAttendancePolicy)
      : null;
  }

  async deleteByRoleAndPolicy(roleId: string, policyId: string): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(roleAttendancePolicy.roleId, roleId),
          eq(roleAttendancePolicy.policyId, policyId),
        ),
      );
  }
}

export class AttendanceLocationRepository
  extends Repository<
    AttendanceLocation,
    CreateAttendanceLocation,
    UpdateAttendanceLocation
  >
  implements IAttendanceLocationRepository
{
  constructor(db: Database) {
    super(db, attendanceLocation);
  }

  async findByCompanyId(companyId: string): Promise<AttendanceLocation[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceLocation.companyId, companyId));
    return results.map(
      (r) => new AttendanceLocation(r as unknown as AttendanceLocation),
    );
  }

  async findByBranchId(branchId: string): Promise<AttendanceLocation[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceLocation.branchId, branchId));
    return results.map(
      (r) => new AttendanceLocation(r as unknown as AttendanceLocation),
    );
  }
}

export class CheckpointLocationRepository
  extends Repository<
    CheckpointLocation,
    CreateCheckpointLocation,
    UpdateCheckpointLocation
  >
  implements ICheckpointLocationRepository
{
  constructor(db: Database) {
    super(db, checkpointLocation);
  }

  async findByCheckpointId(
    checkpointId: string,
  ): Promise<CheckpointLocation[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(checkpointLocation.checkpointId, checkpointId));
    return results.map(
      (r) => new CheckpointLocation(r as unknown as CheckpointLocation),
    );
  }

  async findByLocationId(locationId: string): Promise<CheckpointLocation[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(checkpointLocation.locationId, locationId));
    return results.map(
      (r) => new CheckpointLocation(r as unknown as CheckpointLocation),
    );
  }

  async deleteByCheckpointAndLocation(
    checkpointId: string,
    locationId: string,
  ): Promise<void> {
    await this.db
      .delete(this.table)
      .where(
        and(
          eq(checkpointLocation.checkpointId, checkpointId),
          eq(checkpointLocation.locationId, locationId),
        ),
      );
  }
}

export class RoleWorkScheduleRepository
  extends Repository<
    RoleWorkSchedule,
    CreateRoleWorkSchedule,
    UpdateRoleWorkSchedule
  >
  implements IRoleWorkScheduleRepository
{
  constructor(db: Database) {
    super(db, roleWorkSchedule);
  }

  async findByRoleId(roleId: string): Promise<RoleWorkSchedule[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleWorkSchedule.roleId, roleId));
    return results.map(
      (r) => new RoleWorkSchedule(r as unknown as RoleWorkSchedule),
    );
  }

  async findByCompanyId(companyId: string): Promise<RoleWorkSchedule[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(roleWorkSchedule.companyId, companyId));
    return results.map(
      (r) => new RoleWorkSchedule(r as unknown as RoleWorkSchedule),
    );
  }

  async findCurrentByRoleId(
    roleId: string,
    date: Date,
  ): Promise<RoleWorkSchedule | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(roleWorkSchedule.roleId, roleId),
          lte(roleWorkSchedule.effectiveDate, date),
          or(
            gte(roleWorkSchedule.endDate, date),
            isNull(roleWorkSchedule.endDate),
          ),
        ),
      )
      .limit(1);
    return result
      ? new RoleWorkSchedule(result as unknown as RoleWorkSchedule)
      : null;
  }
}

export class AttendanceRecordRepository
  extends Repository<
    AttendanceRecord,
    CreateAttendanceRecord,
    UpdateAttendanceRecord
  >
  implements IAttendanceRecordRepository
{
  constructor(db: Database) {
    super(db, attendanceRecord);
  }

  async findByCompanyId(companyId: string): Promise<AttendanceRecord[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceRecord.companyId, companyId));
    return results.map(
      (r) => new AttendanceRecord(r as unknown as AttendanceRecord),
    );
  }

  async findByMemberId(companyMemberId: string): Promise<AttendanceRecord[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceRecord.companyMemberId, companyMemberId));
    return results.map(
      (r) => new AttendanceRecord(r as unknown as AttendanceRecord),
    );
  }

  async findByMemberAndDate(
    companyMemberId: string,
    workDate: Date,
  ): Promise<AttendanceRecord | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(attendanceRecord.companyMemberId, companyMemberId),
          eq(attendanceRecord.workDate, workDate),
        ),
      );
    return result
      ? new AttendanceRecord(result as unknown as AttendanceRecord)
      : null;
  }

  async findByCompanyAndDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceRecord[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(attendanceRecord.companyId, companyId),
          gte(attendanceRecord.workDate, startDate),
          lte(attendanceRecord.workDate, endDate),
        ),
      );
    return results.map(
      (r) => new AttendanceRecord(r as unknown as AttendanceRecord),
    );
  }
}

export class AttendanceLogRepository
  extends Repository<AttendanceLog, CreateAttendanceLog, UpdateAttendanceLog>
  implements IAttendanceLogRepository
{
  constructor(db: Database) {
    super(db, attendanceLog);
  }

  async findByRecordId(attendanceRecordId: string): Promise<AttendanceLog[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(attendanceLog.attendanceRecordId, attendanceRecordId));
    return results.map((r) => new AttendanceLog(r as unknown as AttendanceLog));
  }

  async findByRecordAndCheckpoint(
    attendanceRecordId: string,
    checkpointId: string,
  ): Promise<AttendanceLog | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(attendanceLog.attendanceRecordId, attendanceRecordId),
          eq(attendanceLog.checkpointId, checkpointId),
        ),
      );
    return result
      ? new AttendanceLog(result as unknown as AttendanceLog)
      : null;
  }
}

export class LeaveRequestRepository
  extends Repository<LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest>
  implements ILeaveRequestRepository
{
  constructor(db: Database) {
    super(db, leaveRequest);
  }

  async findByCompanyId(companyId: string): Promise<LeaveRequest[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(leaveRequest.companyId, companyId));
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findByMemberId(companyMemberId: string): Promise<LeaveRequest[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(leaveRequest.companyMemberId, companyMemberId));
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findByStatus(
    companyId: string,
    status: string,
  ): Promise<LeaveRequest[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(leaveRequest.companyId, companyId),
          eq(leaveRequest.status, status as LeaveStatus),
        ),
      );
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }
}

import { and, desc, eq, gte, lte } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { notDeleted } from '@repo/database';
import {
  organizationMember,
  leaveQuotas,
  leaveRequests,
  leaveTypes,
} from '@repo/database/schema';
import {
  LeaveQuota,
  LeaveRequest,
  LeaveType,
} from '@repo/domains/entities/leave';
import type {
  ILeaveQuotaRepository,
  ILeaveRequestRepository,
  ILeaveTypeRepository,
} from '@repo/domains/repositories/leave';
import type {
  CreateLeaveQuota,
  CreateLeaveRequest,
  CreateLeaveType,
  UpdateLeaveQuota,
  UpdateLeaveRequest,
  UpdateLeaveType,
} from '@repo/domains/schema/leave';

export class LeaveTypeRepository
  extends Repository<LeaveType, CreateLeaveType, UpdateLeaveType>
  implements ILeaveTypeRepository
{
  constructor(db: Database) {
    super(db, leaveTypes);
  }

  async findByOrganizationId(organizationId: string): Promise<LeaveType[]> {
    const results = await this.db
      .select()
      .from(leaveTypes)
      .where(this.whereActive(eq(leaveTypes.organizationId, organizationId)));
    return results.map((r) => new LeaveType(r as unknown as LeaveType));
  }

  async findActiveByOrganizationId(
    organizationId: string,
  ): Promise<LeaveType[]> {
    const results = await this.db
      .select()
      .from(leaveTypes)
      .where(
        this.whereActive(
          eq(leaveTypes.organizationId, organizationId),
          eq(leaveTypes.isActive, true),
        ),
      );
    return results.map((r) => new LeaveType(r as unknown as LeaveType));
  }

  async findByNameAndOrganization(
    organizationId: string,
    name: string,
  ): Promise<LeaveType | null> {
    const [result] = await this.db
      .select()
      .from(leaveTypes)
      .where(
        this.whereActive(
          eq(leaveTypes.organizationId, organizationId),
          eq(leaveTypes.name, name),
        ),
      );
    return result ? new LeaveType(result as unknown as LeaveType) : null;
  }
}

export class LeaveQuotaRepository
  extends Repository<LeaveQuota, CreateLeaveQuota, UpdateLeaveQuota>
  implements ILeaveQuotaRepository
{
  constructor(db: Database) {
    super(db, leaveQuotas);
  }

  async findByMemberAndYear(
    memberId: string,
    year: number,
  ): Promise<LeaveQuota[]> {
    const results = await this.db
      .select()
      .from(leaveQuotas)
      .where(
        this.whereActive(
          eq(leaveQuotas.organizationMemberId, memberId),
          eq(leaveQuotas.year, year),
        ),
      );
    return results.map((r) => new LeaveQuota(r as unknown as LeaveQuota));
  }

  async findByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveQuota | null> {
    const [result] = await this.db
      .select()
      .from(leaveQuotas)
      .where(
        this.whereActive(
          eq(leaveQuotas.organizationMemberId, memberId),
          eq(leaveQuotas.leaveTypeId, leaveTypeId),
          eq(leaveQuotas.year, year),
        ),
      );
    return result ? new LeaveQuota(result as unknown as LeaveQuota) : null;
  }

  async lockByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveQuota | null> {
    const [result] = await this.db
      .select()
      .from(leaveQuotas)
      .where(
        this.whereActive(
          eq(leaveQuotas.organizationMemberId, memberId),
          eq(leaveQuotas.leaveTypeId, leaveTypeId),
          eq(leaveQuotas.year, year),
        ),
      )
      .for('update');
    return result ? new LeaveQuota(result as unknown as LeaveQuota) : null;
  }
}

export class LeaveRequestRepository
  extends Repository<LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest>
  implements ILeaveRequestRepository
{
  constructor(db: Database) {
    super(db, leaveRequests);
  }

  async findByMemberId(memberId: string): Promise<LeaveRequest[]> {
    const results = await this.db
      .select()
      .from(leaveRequests)
      .where(this.whereActive(eq(leaveRequests.organizationMemberId, memberId)))
      .orderBy(desc(leaveRequests.createdAt));
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findByOrganizationId(
    organizationId: string,
    status?: string,
  ): Promise<LeaveRequest[]> {
    const results = await this.db
      .select({
        id: leaveRequests.id,
        organizationMemberId: leaveRequests.organizationMemberId,
        leaveTypeId: leaveRequests.leaveTypeId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        startTime: leaveRequests.startTime,
        endTime: leaveRequests.endTime,
        minutesPerDaySnapshot: leaveRequests.minutesPerDaySnapshot,
        unit: leaveRequests.unit,
        reason: leaveRequests.reason,
        proofUrl: leaveRequests.proofUrl,
        status: leaveRequests.status,
        reviewedBy: leaveRequests.reviewedBy,
        reviewedAt: leaveRequests.reviewedAt,
        reviewNote: leaveRequests.reviewNote,
        createdAt: leaveRequests.createdAt,
        updatedAt: leaveRequests.updatedAt,
      })
      .from(leaveRequests)
      .innerJoin(
        organizationMember,
        eq(leaveRequests.organizationMemberId, organizationMember.id),
      )
      .where(
        this.whereActive(
          eq(organizationMember.organizationId, organizationId),
          status
            ? eq(leaveRequests.status, status as LeaveRequest['status'])
            : undefined,
          notDeleted(organizationMember),
        ),
      )
      .orderBy(desc(leaveRequests.createdAt));

    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findByMemberAndDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
  ): Promise<LeaveRequest[]> {
    const results = await this.db
      .select()
      .from(leaveRequests)
      .where(
        this.whereActive(
          eq(leaveRequests.organizationMemberId, memberId),
          and(
            eq(leaveRequests.startDate, startDate),
            eq(leaveRequests.endDate, endDate),
          ),
        ),
      );
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findApprovedByMemberTypeAndYear(
    memberId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveRequest[]> {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    const results = await this.db
      .select()
      .from(leaveRequests)
      .where(
        this.whereActive(
          eq(leaveRequests.organizationMemberId, memberId),
          eq(leaveRequests.leaveTypeId, leaveTypeId),
          eq(leaveRequests.status, 'approved'),
          gte(leaveRequests.startDate, yearStart),
          lte(leaveRequests.startDate, yearEnd),
        ),
      );
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }
}

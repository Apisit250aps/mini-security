import { and, desc, eq, or } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  companyMember,
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

  async findByCompanyId(companyId: string): Promise<LeaveType[]> {
    const results = await this.db
      .select()
      .from(leaveTypes)
      .where(eq(leaveTypes.companyId, companyId));
    return results.map((r) => new LeaveType(r as unknown as LeaveType));
  }

  async findActiveByCompanyId(companyId: string): Promise<LeaveType[]> {
    const results = await this.db
      .select()
      .from(leaveTypes)
      .where(
        and(eq(leaveTypes.companyId, companyId), eq(leaveTypes.isActive, true)),
      );
    return results.map((r) => new LeaveType(r as unknown as LeaveType));
  }

  async findByNameAndCompany(
    companyId: string,
    name: string,
  ): Promise<LeaveType | null> {
    const [result] = await this.db
      .select()
      .from(leaveTypes)
      .where(
        and(eq(leaveTypes.companyId, companyId), eq(leaveTypes.name, name)),
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
        and(
          eq(leaveQuotas.companyMemberId, memberId),
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
        and(
          eq(leaveQuotas.companyMemberId, memberId),
          eq(leaveQuotas.leaveTypeId, leaveTypeId),
          eq(leaveQuotas.year, year),
        ),
      );
    return result ? new LeaveQuota(result as unknown as LeaveQuota) : null;
  }

  async updateUsedDays(id: string, usedDays: number): Promise<LeaveQuota> {
    const [result] = await this.db
      .update(leaveQuotas)
      .set({
        usedDays: usedDays.toString(),
        updatedAt: new Date(),
      })
      .where(eq(leaveQuotas.id, id))
      .returning();

    return new LeaveQuota(result as unknown as LeaveQuota);
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
      .where(eq(leaveRequests.companyMemberId, memberId))
      .orderBy(desc(leaveRequests.createdAt));
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }

  async findByCompanyId(
    companyId: string,
    status?: string,
  ): Promise<LeaveRequest[]> {
    const conditions = [eq(companyMember.companyId, companyId)];
    if (status) {
      conditions.push(
        eq(leaveRequests.status, status as LeaveRequest['status']),
      );
    }

    const results = await this.db
      .select({
        id: leaveRequests.id,
        companyMemberId: leaveRequests.companyMemberId,
        leaveTypeId: leaveRequests.leaveTypeId,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        totalDays: leaveRequests.totalDays,
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
        companyMember,
        eq(leaveRequests.companyMemberId, companyMember.id),
      )
      .where(and(...conditions))
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
        and(
          eq(leaveRequests.companyMemberId, memberId),
          or(
            and(
              eq(leaveRequests.startDate, startDate),
              eq(leaveRequests.endDate, endDate),
            ),
          ),
        ),
      );
    return results.map((r) => new LeaveRequest(r as unknown as LeaveRequest));
  }
}

import { and, asc, between, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  attendanceLogs,
  checkInSchedules,
  companyMember,
  scheduleSlots,
} from '@repo/database/schema';
import {
  AttendanceLog,
  CheckInSchedule,
  ScheduleSlot,
} from '@repo/domains/entities/attendance';
import type {
  IAttendanceLogRepository,
  ICheckInScheduleRepository,
  IScheduleSlotRepository,
} from '@repo/domains/repositories/attendance';
import type {
  CreateAttendanceLog,
  CreateCheckInSchedule,
  CreateScheduleSlot,
  UpdateAttendanceLog,
  UpdateCheckInSchedule,
  UpdateScheduleSlot,
} from '@repo/domains/schema/attendance';

export class CheckInScheduleRepository
  extends Repository<
    CheckInSchedule,
    CreateCheckInSchedule,
    UpdateCheckInSchedule
  >
  implements ICheckInScheduleRepository
{
  constructor(db: Database) {
    super(db, checkInSchedules);
  }

  async findByRoleId(roleId: string): Promise<CheckInSchedule | null> {
    const [result] = await this.db
      .select()
      .from(checkInSchedules)
      .where(eq(checkInSchedules.roleId, roleId));
    return result
      ? new CheckInSchedule(result as unknown as CheckInSchedule)
      : null;
  }

  async findByCompanyId(companyId: string): Promise<CheckInSchedule[]> {
    const results = await this.db
      .select()
      .from(checkInSchedules)
      .where(eq(checkInSchedules.companyId, companyId));
    return results.map(
      (r) => new CheckInSchedule(r as unknown as CheckInSchedule),
    );
  }
}

export class ScheduleSlotRepository
  extends Repository<ScheduleSlot, CreateScheduleSlot, UpdateScheduleSlot>
  implements IScheduleSlotRepository
{
  constructor(db: Database) {
    super(db, scheduleSlots);
  }

  async findByScheduleId(scheduleId: string): Promise<ScheduleSlot[]> {
    const results = await this.db
      .select()
      .from(scheduleSlots)
      .where(eq(scheduleSlots.checkInScheduleId, scheduleId))
      .orderBy(asc(scheduleSlots.slotOrder));
    return results.map((r) => new ScheduleSlot(r as unknown as ScheduleSlot));
  }

  async findByScheduleIdAndOrder(
    scheduleId: string,
    slotOrder: number,
  ): Promise<ScheduleSlot | null> {
    const [result] = await this.db
      .select()
      .from(scheduleSlots)
      .where(
        and(
          eq(scheduleSlots.checkInScheduleId, scheduleId),
          eq(scheduleSlots.slotOrder, slotOrder),
        ),
      );
    return result ? new ScheduleSlot(result as unknown as ScheduleSlot) : null;
  }

  async deleteByScheduleId(scheduleId: string): Promise<void> {
    await this.db
      .delete(scheduleSlots)
      .where(eq(scheduleSlots.checkInScheduleId, scheduleId));
  }
}

export class AttendanceLogRepository
  extends Repository<AttendanceLog, CreateAttendanceLog, UpdateAttendanceLog>
  implements IAttendanceLogRepository
{
  constructor(db: Database) {
    super(db, attendanceLogs);
  }

  async findByMemberAndDate(
    memberId: string,
    workDate: string,
  ): Promise<AttendanceLog[]> {
    const results = await this.db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.companyMemberId, memberId),
          eq(attendanceLogs.workDate, workDate),
        ),
      );
    return results.map((r) => new AttendanceLog(r as unknown as AttendanceLog));
  }

  async findByMemberAndSlotAndDate(
    memberId: string,
    slotId: string,
    workDate: string,
  ): Promise<AttendanceLog | null> {
    const [result] = await this.db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.companyMemberId, memberId),
          eq(attendanceLogs.scheduleSlotId, slotId),
          eq(attendanceLogs.workDate, workDate),
        ),
      );
    return result
      ? new AttendanceLog(result as unknown as AttendanceLog)
      : null;
  }

  async findByCompanyAndDateRange(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceLog[]> {
    const results = await this.db
      .select({
        id: attendanceLogs.id,
        companyMemberId: attendanceLogs.companyMemberId,
        scheduleSlotId: attendanceLogs.scheduleSlotId,
        workDate: attendanceLogs.workDate,
        checkedInAt: attendanceLogs.checkedInAt,
        status: attendanceLogs.status,
        note: attendanceLogs.note,
        recordedBy: attendanceLogs.recordedBy,
        createdAt: attendanceLogs.createdAt,
        updatedAt: attendanceLogs.updatedAt,
      })
      .from(attendanceLogs)
      .innerJoin(
        companyMember,
        eq(attendanceLogs.companyMemberId, companyMember.id),
      )
      .where(
        and(
          eq(companyMember.companyId, companyId),
          between(attendanceLogs.workDate, startDate, endDate),
        ),
      );

    return results.map((r) => new AttendanceLog(r as unknown as AttendanceLog));
  }

  async findByMemberAndDateRange(
    memberId: string,
    startDate: string,
    endDate: string,
  ): Promise<AttendanceLog[]> {
    const results = await this.db
      .select()
      .from(attendanceLogs)
      .where(
        and(
          eq(attendanceLogs.companyMemberId, memberId),
          between(attendanceLogs.workDate, startDate, endDate),
        ),
      );
    return results.map((r) => new AttendanceLog(r as unknown as AttendanceLog));
  }

  async upsertLog(data: CreateAttendanceLog): Promise<AttendanceLog> {
    const [result] = await this.db
      .insert(attendanceLogs)
      .values(data)
      .onConflictDoUpdate({
        target: [
          attendanceLogs.companyMemberId,
          attendanceLogs.scheduleSlotId,
          attendanceLogs.workDate,
        ],
        set: {
          checkedInAt: data.checkedInAt,
          status: data.status,
          note: data.note,
          recordedBy: data.recordedBy,
          updatedAt: new Date(),
        },
      })
      .returning();

    return new AttendanceLog(result as unknown as AttendanceLog);
  }
}

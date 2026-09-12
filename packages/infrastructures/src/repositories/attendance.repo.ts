import {
  and,
  asc,
  between,
  eq,
  exists,
  or,
  isNull,
  type SQL,
} from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import {
  attendanceLogs,
  checkInSchedules,
  checkInScheduleRoles,
  companyMember,
  role,
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

  private async load(where?: SQL): Promise<CheckInSchedule[]> {
    const rows = await this.db
      .select({
        schedule: checkInSchedules,
        roleId: checkInScheduleRoles.roleId,
      })
      .from(checkInSchedules)
      .leftJoin(
        checkInScheduleRoles,
        and(
          eq(checkInScheduleRoles.checkInScheduleId, checkInSchedules.id),
          eq(checkInScheduleRoles.isActive, true),
        ),
      )
      .where(where)
      .orderBy(
        asc(checkInSchedules.name),
        asc(checkInSchedules.id),
        asc(checkInScheduleRoles.roleId),
      );
    const schedules = new Map<string, CheckInSchedule>();
    for (const row of rows) {
      let schedule = schedules.get(row.schedule.id);
      if (!schedule) {
        schedule = new CheckInSchedule({ ...row.schedule, roleIds: [] });
        schedules.set(schedule.id, schedule);
      }
      if (row.roleId) schedule.roleIds.push(row.roleId);
    }
    return [...schedules.values()];
  }

  override async findAll(): Promise<CheckInSchedule[]> {
    return this.load();
  }

  override async findById(id: string): Promise<CheckInSchedule | null> {
    return (await this.load(eq(checkInSchedules.id, id)))[0] ?? null;
  }

  override async create(data: CreateCheckInSchedule): Promise<CheckInSchedule> {
    const { roleIds, ...values } = data;
    return this.db.transaction(async (tx) => {
      const [schedule] = await tx
        .insert(checkInSchedules)
        .values(values)
        .returning();
      if (!schedule) throw new Error('Schedule creation failed');
      if (roleIds.length) {
        await tx.insert(checkInScheduleRoles).values(
          roleIds.map((roleId) => ({
            companyId: schedule.companyId,
            checkInScheduleId: schedule.id,
            roleId,
          })),
        );
      }
      return new CheckInSchedule({ ...schedule, roleIds });
    });
  }

  override async update(
    id: string,
    data: UpdateCheckInSchedule,
  ): Promise<CheckInSchedule> {
    const { roleIds, ...values } = data;
    return this.db.transaction(async (tx) => {
      // Lock the aggregate root before replacing assignments, including roles-only edits.
      const [schedule] = await tx
        .update(checkInSchedules)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(checkInSchedules.id, id))
        .returning();
      if (!schedule) throw new Error('Schedule no longer exists');
      if (roleIds !== undefined) {
        await tx
          .update(checkInScheduleRoles)
          .set({ isActive: false })
          .where(eq(checkInScheduleRoles.checkInScheduleId, id));
        if (roleIds.length) {
          await tx
            .insert(checkInScheduleRoles)
            .values(
              roleIds.map((roleId) => ({
                companyId: schedule.companyId,
                checkInScheduleId: id,
                roleId,
              })),
            )
            .onConflictDoUpdate({
              target: [
                checkInScheduleRoles.checkInScheduleId,
                checkInScheduleRoles.roleId,
              ],
              set: { isActive: true, updatedAt: new Date() },
            });
        }
      }
      const assignments = await tx
        .select({ roleId: checkInScheduleRoles.roleId })
        .from(checkInScheduleRoles)
        .where(
          and(
            eq(checkInScheduleRoles.checkInScheduleId, id),
            eq(checkInScheduleRoles.isActive, true),
          ),
        );
      return new CheckInSchedule({
        ...schedule,
        roleIds: assignments.map((assignment) => assignment.roleId),
      });
    });
  }

  async findByRoleId(
    companyId: string,
    roleId: string,
  ): Promise<CheckInSchedule[]> {
    const assigned = this.db
      .select({ id: checkInScheduleRoles.id })
      .from(checkInScheduleRoles)
      .innerJoin(role, eq(role.id, checkInScheduleRoles.roleId))
      .where(
        and(
          eq(checkInScheduleRoles.checkInScheduleId, checkInSchedules.id),
          eq(checkInScheduleRoles.companyId, companyId),
          eq(checkInScheduleRoles.roleId, roleId),
          eq(checkInScheduleRoles.isActive, true),
          or(
            eq(role.companyId, companyId),
            and(isNull(role.companyId), eq(role.isSystemDefault, true)),
          ),
        ),
      );
    return this.load(
      and(
        eq(checkInSchedules.companyId, companyId),
        eq(checkInSchedules.isActive, true),
        exists(assigned),
      ),
    );
  }

  async findByCompanyId(companyId: string): Promise<CheckInSchedule[]> {
    return this.load(eq(checkInSchedules.companyId, companyId));
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

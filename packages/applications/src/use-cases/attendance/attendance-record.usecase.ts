import type {
  IApproveAttendanceRecordContext,
  IApproveAttendanceRecordUseCase,
  ICreateAttendanceRecordContext,
  ICreateAttendanceRecordUseCase,
  IDeleteAttendanceRecordContext,
  IDeleteAttendanceRecordUseCase,
  IGetAttendanceRecordContext,
  IGetAttendanceRecordUseCase,
  IGetAttendanceRecordsContext,
  IGetAttendanceRecordsUseCase,
  IGetMemberAttendanceRecordByDateContext,
  IGetMemberAttendanceRecordByDateUseCase,
  IUpdateAttendanceRecordContext,
  IUpdateAttendanceRecordUseCase,
} from '@repo/domains/applications/attendance';
import type { AttendanceRecord } from '@repo/domains/entities/attendance';
import type {
  IAttendanceRecordRepository,
  IWorkShiftRepository,
} from '@repo/domains/repositories/attendance';
import type { ICompanyMemberRepository } from '@repo/domains/repositories/company';
import {
  createAttendanceRecordSchema,
  updateAttendanceRecordSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateAttendanceRecordUseCase
  implements ICreateAttendanceRecordUseCase
{
  constructor(
    private readonly recordRepository: IAttendanceRecordRepository,
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly shiftRepository: IWorkShiftRepository,
  ) {}

  @RequirePermission('attendance_record:create')
  async execute(
    context: ICreateAttendanceRecordContext,
  ): Promise<AttendanceRecord> {
    const parsed = await createAttendanceRecordSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance record data',
        parsed.error.format(),
      );
    }

    const member = await this.memberRepository.findById(
      parsed.data.companyMemberId,
    );
    if (!member) {
      throw new NotFoundError(
        `Company member with id ${parsed.data.companyMemberId} not found`,
      );
    }

    const shift = await this.shiftRepository.findById(parsed.data.workShiftId);
    if (!shift) {
      throw new NotFoundError(
        `Work shift with id ${parsed.data.workShiftId} not found`,
      );
    }

    const existing = await this.recordRepository.findByMemberAndDate(
      parsed.data.companyMemberId,
      parsed.data.workDate,
    );
    if (existing) {
      throw new DuplicateError(
        'Attendance record already exists for this member on this date',
      );
    }

    return this.recordRepository.create(parsed.data);
  }
}

export class UpdateAttendanceRecordUseCase
  implements IUpdateAttendanceRecordUseCase
{
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:update')
  async execute(
    context: IUpdateAttendanceRecordContext,
  ): Promise<AttendanceRecord> {
    const existing = await this.recordRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance record with id ${context.id} not found`,
      );
    }

    const parsed = await updateAttendanceRecordSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update attendance record data',
        parsed.error.format(),
      );
    }

    return this.recordRepository.update(context.id, parsed.data);
  }
}

export class DeleteAttendanceRecordUseCase
  implements IDeleteAttendanceRecordUseCase
{
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:delete')
  async execute(context: IDeleteAttendanceRecordContext): Promise<void> {
    const existing = await this.recordRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance record with id ${context.id} not found`,
      );
    }
    await this.recordRepository.delete(context.id);
  }
}

export class GetAttendanceRecordUseCase implements IGetAttendanceRecordUseCase {
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:read')
  async execute(
    context: IGetAttendanceRecordContext,
  ): Promise<AttendanceRecord | null> {
    const item = await this.recordRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Attendance record with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetAttendanceRecordsUseCase
  implements IGetAttendanceRecordsUseCase
{
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:read')
  async execute(
    context: IGetAttendanceRecordsContext,
  ): Promise<AttendanceRecord[]> {
    if (context.startDate && context.endDate) {
      return this.recordRepository.findByCompanyAndDateRange(
        context.companyId,
        context.startDate,
        context.endDate,
      );
    }
    if (context.memberId) {
      return this.recordRepository.findByMemberId(context.memberId);
    }
    return this.recordRepository.findByCompanyId(context.companyId);
  }
}

export class GetMemberAttendanceRecordByDateUseCase
  implements IGetMemberAttendanceRecordByDateUseCase
{
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:read')
  async execute(
    context: IGetMemberAttendanceRecordByDateContext,
  ): Promise<AttendanceRecord | null> {
    return this.recordRepository.findByMemberAndDate(
      context.companyMemberId,
      context.workDate,
    );
  }
}

export class ApproveAttendanceRecordUseCase
  implements IApproveAttendanceRecordUseCase
{
  constructor(private readonly recordRepository: IAttendanceRecordRepository) {}

  @RequirePermission('attendance_record:approve')
  async execute(
    context: IApproveAttendanceRecordContext,
  ): Promise<AttendanceRecord> {
    const existing = await this.recordRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance record with id ${context.id} not found`,
      );
    }

    return this.recordRepository.update(context.id, {
      status: context.status,
      approvedBy: context.approvedBy,
      approvedAt: new Date(),
      note: context.note ?? existing.note,
    });
  }
}

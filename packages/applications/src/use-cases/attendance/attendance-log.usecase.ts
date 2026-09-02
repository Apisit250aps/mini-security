import type {
  ICreateAttendanceLogContext,
  ICreateAttendanceLogUseCase,
  IDeleteAttendanceLogContext,
  IDeleteAttendanceLogUseCase,
  IGetAttendanceLogContext,
  IGetAttendanceLogUseCase,
  IGetAttendanceLogsByRecordContext,
  IGetAttendanceLogsByRecordUseCase,
  IUpdateAttendanceLogContext,
  IUpdateAttendanceLogUseCase,
} from '@repo/domains/applications/attendance';
import type { AttendanceLog } from '@repo/domains/entities/attendance';
import type {
  IAttendanceCheckpointRepository,
  IAttendanceLogRepository,
  IAttendanceRecordRepository,
} from '@repo/domains/repositories/attendance';
import {
  createAttendanceLogSchema,
  updateAttendanceLogSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateAttendanceLogUseCase implements ICreateAttendanceLogUseCase {
  constructor(
    private readonly logRepository: IAttendanceLogRepository,
    private readonly recordRepository: IAttendanceRecordRepository,
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
  ) {}

  @RequirePermission('attendance_log:create')
  async execute(context: ICreateAttendanceLogContext): Promise<AttendanceLog> {
    const parsed = await createAttendanceLogSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance log data',
        parsed.error.format(),
      );
    }

    const record = await this.recordRepository.findById(
      parsed.data.attendanceRecordId,
    );
    if (!record) {
      throw new NotFoundError(
        `Attendance record with id ${parsed.data.attendanceRecordId} not found`,
      );
    }

    const checkpoint = await this.checkpointRepository.findById(
      parsed.data.checkpointId,
    );
    if (!checkpoint) {
      throw new NotFoundError(
        `Attendance checkpoint with id ${parsed.data.checkpointId} not found`,
      );
    }

    const existing = await this.logRepository.findByRecordAndCheckpoint(
      parsed.data.attendanceRecordId,
      parsed.data.checkpointId,
    );
    if (existing) {
      throw new DuplicateError(
        'Attendance log already exists for this checkpoint on this record',
      );
    }

    return this.logRepository.create(parsed.data);
  }
}

export class UpdateAttendanceLogUseCase implements IUpdateAttendanceLogUseCase {
  constructor(private readonly logRepository: IAttendanceLogRepository) {}

  @RequirePermission('attendance_log:create')
  async execute(context: IUpdateAttendanceLogContext): Promise<AttendanceLog> {
    const existing = await this.logRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Attendance log with id ${context.id} not found`);
    }

    const parsed = await updateAttendanceLogSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update attendance log data',
        parsed.error.format(),
      );
    }

    return this.logRepository.update(context.id, parsed.data);
  }
}

export class DeleteAttendanceLogUseCase implements IDeleteAttendanceLogUseCase {
  constructor(private readonly logRepository: IAttendanceLogRepository) {}

  @RequirePermission('attendance_log:delete')
  async execute(context: IDeleteAttendanceLogContext): Promise<void> {
    const existing = await this.logRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Attendance log with id ${context.id} not found`);
    }
    await this.logRepository.delete(context.id);
  }
}

export class GetAttendanceLogUseCase implements IGetAttendanceLogUseCase {
  constructor(private readonly logRepository: IAttendanceLogRepository) {}

  @RequirePermission('attendance_log:read')
  async execute(
    context: IGetAttendanceLogContext,
  ): Promise<AttendanceLog | null> {
    const item = await this.logRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(`Attendance log with id ${context.id} not found`);
    }
    return item;
  }
}

export class GetAttendanceLogsByRecordUseCase
  implements IGetAttendanceLogsByRecordUseCase
{
  constructor(private readonly logRepository: IAttendanceLogRepository) {}

  @RequirePermission('attendance_log:read')
  async execute(
    context: IGetAttendanceLogsByRecordContext,
  ): Promise<AttendanceLog[]> {
    return this.logRepository.findByRecordId(context.attendanceRecordId);
  }
}

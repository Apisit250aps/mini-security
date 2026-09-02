import type {
  IAssignCheckpointLocationContext,
  IAssignCheckpointLocationUseCase,
  ICreateAttendanceLocationContext,
  ICreateAttendanceLocationUseCase,
  IDeleteAttendanceLocationContext,
  IDeleteAttendanceLocationUseCase,
  IGetAttendanceLocationContext,
  IGetAttendanceLocationUseCase,
  IGetAttendanceLocationsContext,
  IGetAttendanceLocationsUseCase,
  IGetCheckpointLocationsContext,
  IGetCheckpointLocationsUseCase,
  IRemoveCheckpointLocationContext,
  IRemoveCheckpointLocationUseCase,
  IUpdateAttendanceLocationContext,
  IUpdateAttendanceLocationUseCase,
} from '@repo/domains/applications/attendance';
import type {
  AttendanceLocation,
  CheckpointLocation,
} from '@repo/domains/entities/attendance';
import type {
  IAttendanceCheckpointRepository,
  IAttendanceLocationRepository,
  ICheckpointLocationRepository,
} from '@repo/domains/repositories/attendance';
import {
  createAttendanceLocationSchema,
  createCheckpointLocationSchema,
  updateAttendanceLocationSchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import { NotFoundError, ValidationError } from '../../lib/error';

export class CreateAttendanceLocationUseCase
  implements ICreateAttendanceLocationUseCase
{
  constructor(private readonly repository: IAttendanceLocationRepository) {}

  @RequirePermission('attendance_location:create')
  async execute(
    context: ICreateAttendanceLocationContext,
  ): Promise<AttendanceLocation> {
    const parsed = await createAttendanceLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance location data',
        parsed.error.format(),
      );
    }
    return this.repository.create(parsed.data);
  }
}

export class UpdateAttendanceLocationUseCase
  implements IUpdateAttendanceLocationUseCase
{
  constructor(private readonly repository: IAttendanceLocationRepository) {}

  @RequirePermission('attendance_location:update')
  async execute(
    context: IUpdateAttendanceLocationContext,
  ): Promise<AttendanceLocation> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance location with id ${context.id} not found`,
      );
    }

    const parsed = await updateAttendanceLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update attendance location data',
        parsed.error.format(),
      );
    }

    return this.repository.update(context.id, parsed.data);
  }
}

export class DeleteAttendanceLocationUseCase
  implements IDeleteAttendanceLocationUseCase
{
  constructor(private readonly repository: IAttendanceLocationRepository) {}

  @RequirePermission('attendance_location:delete')
  async execute(context: IDeleteAttendanceLocationContext): Promise<void> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance location with id ${context.id} not found`,
      );
    }
    await this.repository.delete(context.id);
  }
}

export class GetAttendanceLocationUseCase
  implements IGetAttendanceLocationUseCase
{
  constructor(private readonly repository: IAttendanceLocationRepository) {}

  @RequirePermission('attendance_location:read')
  async execute(
    context: IGetAttendanceLocationContext,
  ): Promise<AttendanceLocation | null> {
    const item = await this.repository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Attendance location with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetAttendanceLocationsUseCase
  implements IGetAttendanceLocationsUseCase
{
  constructor(private readonly repository: IAttendanceLocationRepository) {}

  @RequirePermission('attendance_location:read')
  async execute(
    context: IGetAttendanceLocationsContext,
  ): Promise<AttendanceLocation[]> {
    return this.repository.findByCompanyId(context.companyId);
  }
}

// Checkpoint Location Use Cases
export class AssignCheckpointLocationUseCase
  implements IAssignCheckpointLocationUseCase
{
  constructor(
    private readonly checkpointLocationRepository: ICheckpointLocationRepository,
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
    private readonly locationRepository: IAttendanceLocationRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:update')
  async execute(
    context: IAssignCheckpointLocationContext,
  ): Promise<CheckpointLocation> {
    const parsed = await createCheckpointLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid checkpoint location data',
        parsed.error.format(),
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

    const location = await this.locationRepository.findById(
      parsed.data.locationId,
    );
    if (!location) {
      throw new NotFoundError(
        `Attendance location with id ${parsed.data.locationId} not found`,
      );
    }

    return this.checkpointLocationRepository.create(parsed.data);
  }
}

export class RemoveCheckpointLocationUseCase
  implements IRemoveCheckpointLocationUseCase
{
  constructor(
    private readonly checkpointLocationRepository: ICheckpointLocationRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:update')
  async execute(context: IRemoveCheckpointLocationContext): Promise<void> {
    await this.checkpointLocationRepository.deleteByCheckpointAndLocation(
      context.checkpointId,
      context.locationId,
    );
  }
}

export class GetCheckpointLocationsUseCase
  implements IGetCheckpointLocationsUseCase
{
  constructor(
    private readonly checkpointLocationRepository: ICheckpointLocationRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:read')
  async execute(
    context: IGetCheckpointLocationsContext,
  ): Promise<CheckpointLocation[]> {
    return this.checkpointLocationRepository.findByCheckpointId(
      context.checkpointId,
    );
  }
}

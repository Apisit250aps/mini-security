import { PermissionGuard } from '../../lib/guard';
import { RequirePermission } from '../../decorators/permission.decorator';
import type {
  IAssignSlotLocationContext,
  IAssignSlotLocationUseCase,
  ICreateLocationContext,
  ICreateLocationUseCase,
  IDeleteLocationContext,
  IDeleteLocationUseCase,
  IGetLocationContext,
  IGetLocationsByBranchContext,
  IGetLocationsByBranchUseCase,
  IGetLocationsByCompanyContext,
  IGetLocationsByCompanyUseCase,
  IGetLocationUseCase,
  IGetSlotLocationsContext,
  IGetSlotLocationsUseCase,
  ISetPrimaryLocationContext,
  ISetPrimaryLocationUseCase,
  IUpdateLocationContext,
  IUpdateLocationUseCase,
  IUpdateSlotLocationContext,
  IUpdateSlotLocationUseCase,
} from '@repo/domains/applications/location';
import type {
  Location,
  ScheduleSlotLocation,
} from '@repo/domains/entities/location';
import type {
  ILocationRepository,
  IScheduleSlotLocationRepository,
} from '@repo/domains/repositories/location';
import {
  createLocationSchema,
  createScheduleSlotLocationSchema,
  updateLocationSchema,
  updateScheduleSlotLocationSchema,
} from '@repo/domains/schema/location';
import { NotFoundError, ValidationError } from '../../lib/error';

export class CreateLocationUseCase implements ICreateLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: ICreateLocationContext): Promise<Location> {
    PermissionGuard.requireCompanyScope(context, context.data.companyId);

    const parsed = await createLocationSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    if (parsed.data.isPrimary) {
      const existing = await this.locationRepo.findPrimaryByBranchId(
        parsed.data.companyBranchId,
      );
      if (existing) {
        const created = await this.locationRepo.create({
          ...parsed.data,
          isPrimary: false,
        });
        return await this.locationRepo.setPrimaryLocation(
          context.data.companyId,
          parsed.data.companyBranchId,
          created.id,
        );
      }
    }

    return await this.locationRepo.create(parsed.data);
  }
}

export class UpdateLocationUseCase implements IUpdateLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: IUpdateLocationContext): Promise<Location> {
    const existing = await this.locationRepo.findById(context.id);
    if (!existing) {
      throw new NotFoundError('Location not found');
    }
    PermissionGuard.requireCompanyScope(context, existing.companyId);

    const parsed = await updateLocationSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    if (parsed.data.isPrimary) {
      await this.locationRepo.setPrimaryLocation(
        existing.companyId,
        existing.companyBranchId,
        existing.id,
      );
    }

    return await this.locationRepo.update(context.id, parsed.data);
  }
}

export class DeleteLocationUseCase implements IDeleteLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: IDeleteLocationContext): Promise<void> {
    PermissionGuard.requireCompanyScope(context, context.companyId);

    const existing = await this.locationRepo.findById(context.id);
    if (!existing) {
      throw new NotFoundError('Location not found');
    }

    await this.locationRepo.delete(context.id);
  }
}

export class GetLocationUseCase implements IGetLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(context: IGetLocationContext): Promise<Location | null> {
    const location = await this.locationRepo.findById(context.id);
    if (location) {
      PermissionGuard.requireCompanyScope(context, location.companyId);
    }
    return location;
  }
}

export class GetLocationsByBranchUseCase
  implements IGetLocationsByBranchUseCase
{
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(context: IGetLocationsByBranchContext): Promise<Location[]> {
    return await this.locationRepo.findActiveByBranchId(
      context.companyBranchId,
    );
  }
}

export class GetLocationsByCompanyUseCase
  implements IGetLocationsByCompanyUseCase
{
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(context: IGetLocationsByCompanyContext): Promise<Location[]> {
    PermissionGuard.requireCompanyScope(context, context.companyId);
    return await this.locationRepo.findByCompanyId(context.companyId);
  }
}

export class SetPrimaryLocationUseCase implements ISetPrimaryLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: ISetPrimaryLocationContext): Promise<Location> {
    PermissionGuard.requireCompanyScope(context, context.companyId);
    return await this.locationRepo.setPrimaryLocation(
      context.companyId,
      context.companyBranchId,
      context.locationId,
    );
  }
}

export class AssignSlotLocationUseCase implements IAssignSlotLocationUseCase {
  constructor(
    private readonly slotLocationRepo: IScheduleSlotLocationRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(
    context: IAssignSlotLocationContext,
  ): Promise<ScheduleSlotLocation> {
    PermissionGuard.requireCompanyScope(context, context.data.companyId);

    const parsed = await createScheduleSlotLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    const existing = await this.slotLocationRepo.findBySlotAndLocation(
      parsed.data.scheduleSlotId,
      parsed.data.locationId,
    );
    if (existing) {
      return existing;
    }

    return await this.slotLocationRepo.create(parsed.data);
  }
}

export class UpdateSlotLocationUseCase implements IUpdateSlotLocationUseCase {
  constructor(
    private readonly slotLocationRepo: IScheduleSlotLocationRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(
    context: IUpdateSlotLocationContext,
  ): Promise<ScheduleSlotLocation> {
    const existing = await this.slotLocationRepo.findById(context.id);
    if (!existing) {
      throw new NotFoundError('Slot location not found');
    }
    PermissionGuard.requireCompanyScope(context, existing.companyId);

    const parsed = await updateScheduleSlotLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    return await this.slotLocationRepo.update(context.id, parsed.data);
  }
}

export class GetSlotLocationsUseCase implements IGetSlotLocationsUseCase {
  constructor(
    private readonly slotLocationRepo: IScheduleSlotLocationRepository,
  ) {}

  @RequirePermission('attendance:read')
  async execute(context: IGetSlotLocationsContext): Promise<Location[]> {
    return await this.slotLocationRepo.findActiveLocationsBySlotId(
      context.scheduleSlotId,
    );
  }
}

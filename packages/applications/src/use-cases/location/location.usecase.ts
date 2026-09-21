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
  IGetLocationsBySiteContext,
  IGetLocationsBySiteUseCase,
  IGetLocationsByOrganizationContext,
  IGetLocationsByOrganizationUseCase,
  IGetLocationUseCase,
  IGetSlotLocationsContext,
  IGetSlotLocationAssignmentsUseCase,
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
import type { IScheduleSlotRepository } from '@repo/domains/repositories/attendance';
import { NotFoundError, ValidationError } from '../../lib/error';
import { requireEntityExists } from '../../lib/guards';

export class CreateLocationUseCase implements ICreateLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: ICreateLocationContext): Promise<Location> {
    PermissionGuard.requireOrganizationScope(
      context,
      context.data.organizationId,
    );

    const parsed = await createLocationSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    if (parsed.data.isPrimary) {
      const existing = await this.locationRepo.findPrimaryBySiteId(
        parsed.data.siteId,
      );
      if (existing) {
        const created = await this.locationRepo.create({
          ...parsed.data,
          isPrimary: false,
        });
        return await this.locationRepo.setPrimaryLocation(
          context.data.organizationId,
          parsed.data.siteId,
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
    const existing = await requireEntityExists(
      () => this.locationRepo.findById(context.id),
      'Location not found',
    );
    PermissionGuard.requireOrganizationScope(context, existing.organizationId);

    const parsed = await updateLocationSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    if (parsed.data.isPrimary) {
      await this.locationRepo.setPrimaryLocation(
        existing.organizationId,
        existing.siteId,
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
    PermissionGuard.requireOrganizationScope(context, context.organizationId);

    await requireEntityExists(
      () => this.locationRepo.findById(context.id),
      'Location not found',
    );

    await this.locationRepo.delete(context.id);
  }
}

export class GetLocationUseCase implements IGetLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(context: IGetLocationContext): Promise<Location | null> {
    const location = await this.locationRepo.findById(context.id);
    if (location) {
      PermissionGuard.requireOrganizationScope(
        context,
        location.organizationId,
      );
    }
    return location;
  }
}

export class GetLocationsBySiteUseCase implements IGetLocationsBySiteUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(context: IGetLocationsBySiteContext): Promise<Location[]> {
    return await this.locationRepo.findActiveBySiteId(context.siteId);
  }
}

export class GetLocationsByOrganizationUseCase
  implements IGetLocationsByOrganizationUseCase
{
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:read')
  async execute(
    context: IGetLocationsByOrganizationContext,
  ): Promise<Location[]> {
    PermissionGuard.requireOrganizationScope(context, context.organizationId);
    return await this.locationRepo.findByOrganizationId(context.organizationId);
  }
}

export class SetPrimaryLocationUseCase implements ISetPrimaryLocationUseCase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  @RequirePermission('location:manage')
  async execute(context: ISetPrimaryLocationContext): Promise<Location> {
    PermissionGuard.requireOrganizationScope(context, context.organizationId);
    return await this.locationRepo.setPrimaryLocation(
      context.organizationId,
      context.siteId,
      context.locationId,
    );
  }
}

export class AssignSlotLocationUseCase implements IAssignSlotLocationUseCase {
  constructor(
    private readonly slotLocationRepo: IScheduleSlotLocationRepository,
    private readonly slotRepo: IScheduleSlotRepository,
    private readonly locationRepo: ILocationRepository,
  ) {}

  @RequirePermission('attendance_schedule:manage')
  async execute(
    context: IAssignSlotLocationContext,
  ): Promise<ScheduleSlotLocation> {
    PermissionGuard.requireOrganizationScope(
      context,
      context.data.organizationId,
    );

    const parsed = await createScheduleSlotLocationSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    const [slot, location] = await Promise.all([
      this.slotRepo.findById(parsed.data.scheduleSlotId),
      this.locationRepo.findById(parsed.data.locationId),
    ]);
    if (!slot || !location)
      throw new NotFoundError('Slot or location not found');
    PermissionGuard.requireOrganizationScope(context, slot.organizationId);
    PermissionGuard.requireOrganizationScope(context, location.organizationId);
    if (
      slot.organizationId !== parsed.data.organizationId ||
      location.organizationId !== parsed.data.organizationId
    ) {
      throw new ValidationError(
        'Slot and location must belong to the specified organization',
      );
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
    const existing = await requireEntityExists(
      () => this.slotLocationRepo.findById(context.id),
      'Slot location not found',
    );
    PermissionGuard.requireOrganizationScope(context, existing.organizationId);

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
    private readonly slotRepo: IScheduleSlotRepository,
  ) {}

  @RequirePermission('attendance:read')
  async execute(context: IGetSlotLocationsContext): Promise<Location[]> {
    const slot = await this.slotRepo.findById(context.scheduleSlotId);
    if (!slot) throw new NotFoundError('Schedule slot not found');
    PermissionGuard.requireOrganizationScope(context, slot.organizationId);
    return await this.slotLocationRepo.findActiveLocationsBySlotId(
      context.scheduleSlotId,
    );
  }
}

export class GetSlotLocationAssignmentsUseCase
  implements IGetSlotLocationAssignmentsUseCase
{
  constructor(
    private readonly slotLocationRepo: IScheduleSlotLocationRepository,
    private readonly slotRepo: IScheduleSlotRepository,
  ) {}

  @RequirePermission('attendance_schedule:read')
  async execute(
    context: IGetSlotLocationsContext,
  ): Promise<ScheduleSlotLocation[]> {
    const slot = await this.slotRepo.findById(context.scheduleSlotId);
    if (!slot) throw new NotFoundError('Schedule slot not found');
    PermissionGuard.requireOrganizationScope(context, slot.organizationId);
    return this.slotLocationRepo.findBySlotId(slot.id);
  }
}

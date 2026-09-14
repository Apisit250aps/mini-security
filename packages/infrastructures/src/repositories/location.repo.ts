import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { locations, scheduleSlotLocation } from '@repo/database/schema';
import { Location, ScheduleSlotLocation } from '@repo/domains/entities/location';
import type {
  ILocationRepository,
  IScheduleSlotLocationRepository,
} from '@repo/domains/repositories/location';
import type {
  CreateLocation,
  CreateScheduleSlotLocation,
  UpdateLocation,
  UpdateScheduleSlotLocation,
} from '@repo/domains/schema/location';

export class LocationRepository
  extends Repository<Location, CreateLocation, UpdateLocation>
  implements ILocationRepository
{
  constructor(db: Database) {
    super(db, locations);
  }

  async findByCompanyId(companyId: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(eq(locations.companyId, companyId));
    return results.map((r) => new Location(r as unknown as Location));
  }

  async findByBranchId(branchId: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(eq(locations.companyBranchId, branchId));
    return results.map((r) => new Location(r as unknown as Location));
  }

  async findActiveByBranchId(branchId: string): Promise<Location[]> {
    const results = await this.db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.companyBranchId, branchId),
          eq(locations.isActive, true),
        ),
      );
    return results.map((r) => new Location(r as unknown as Location));
  }

  async findPrimaryByBranchId(branchId: string): Promise<Location | null> {
    const [result] = await this.db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.companyBranchId, branchId),
          eq(locations.isPrimary, true),
        ),
      );
    return result ? new Location(result as unknown as Location) : null;
  }

  async setPrimaryLocation(
    companyId: string,
    branchId: string,
    locationId: string,
  ): Promise<Location> {
    return await this.db.transaction(async (tx) => {
      // Unset previous primary location for this branch
      await tx
        .update(locations)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(
          and(
            eq(locations.companyId, companyId),
            eq(locations.companyBranchId, branchId),
            eq(locations.isPrimary, true),
          ),
        );

      // Set new primary location (primary must be active)
      const [updated] = await tx
        .update(locations)
        .set({ isPrimary: true, isActive: true, updatedAt: new Date() })
        .where(
          and(
            eq(locations.id, locationId),
            eq(locations.companyId, companyId),
            eq(locations.companyBranchId, branchId),
          ),
        )
        .returning();

      if (!updated) {
        throw new Error('Location not found in specified company and branch');
      }

      return new Location(updated as unknown as Location);
    });
  }
}

export class ScheduleSlotLocationRepository
  extends Repository<
    ScheduleSlotLocation,
    CreateScheduleSlotLocation,
    UpdateScheduleSlotLocation
  >
  implements IScheduleSlotLocationRepository
{
  constructor(db: Database) {
    super(db, scheduleSlotLocation);
  }

  async findBySlotId(slotId: string): Promise<ScheduleSlotLocation[]> {
    const results = await this.db
      .select()
      .from(scheduleSlotLocation)
      .where(eq(scheduleSlotLocation.scheduleSlotId, slotId));
    return results.map(
      (r) => new ScheduleSlotLocation(r as unknown as ScheduleSlotLocation),
    );
  }

  async findByLocationId(locationId: string): Promise<ScheduleSlotLocation[]> {
    const results = await this.db
      .select()
      .from(scheduleSlotLocation)
      .where(eq(scheduleSlotLocation.locationId, locationId));
    return results.map(
      (r) => new ScheduleSlotLocation(r as unknown as ScheduleSlotLocation),
    );
  }

  async findBySlotAndLocation(
    slotId: string,
    locationId: string,
  ): Promise<ScheduleSlotLocation | null> {
    const [result] = await this.db
      .select()
      .from(scheduleSlotLocation)
      .where(
        and(
          eq(scheduleSlotLocation.scheduleSlotId, slotId),
          eq(scheduleSlotLocation.locationId, locationId),
        ),
      );
    return result
      ? new ScheduleSlotLocation(result as unknown as ScheduleSlotLocation)
      : null;
  }

  async findActiveLocationsBySlotId(slotId: string): Promise<Location[]> {
    const results = await this.db
      .select({
        id: locations.id,
        companyId: locations.companyId,
        companyBranchId: locations.companyBranchId,
        name: locations.name,
        address: locations.address,
        latitude: locations.latitude,
        longitude: locations.longitude,
        radiusMeters: locations.radiusMeters,
        isPrimary: locations.isPrimary,
        isActive: locations.isActive,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(scheduleSlotLocation)
      .innerJoin(
        locations,
        and(
          eq(scheduleSlotLocation.locationId, locations.id),
          eq(scheduleSlotLocation.companyId, locations.companyId),
        ),
      )
      .where(
        and(
          eq(scheduleSlotLocation.scheduleSlotId, slotId),
          eq(locations.isActive, true),
        ),
      );
    return results.map((r) => new Location(r as unknown as Location));
  }
}

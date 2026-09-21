import type { BaseRepository } from '../index';
import type { Location, ScheduleSlotLocation } from '#entities/location';
import type {
  CreateLocation,
  CreateScheduleSlotLocation,
  UpdateLocation,
  UpdateScheduleSlotLocation,
} from '#schema/location';

export interface ILocationRepository
  extends BaseRepository<Location, CreateLocation, UpdateLocation> {
  findByOrganizationId(organizationId: string): Promise<Location[]>;
  findBySiteId(siteId: string): Promise<Location[]>;
  findActiveBySiteId(siteId: string): Promise<Location[]>;
  findPrimaryBySiteId(siteId: string): Promise<Location | null>;
  setPrimaryLocation(
    organizationId: string,
    siteId: string,
    locationId: string,
  ): Promise<Location>;
}

export interface IScheduleSlotLocationRepository
  extends BaseRepository<
    ScheduleSlotLocation,
    CreateScheduleSlotLocation,
    UpdateScheduleSlotLocation
  > {
  findBySlotId(slotId: string): Promise<ScheduleSlotLocation[]>;
  findByLocationId(locationId: string): Promise<ScheduleSlotLocation[]>;
  findBySlotAndLocation(
    slotId: string,
    locationId: string,
  ): Promise<ScheduleSlotLocation | null>;
  findActiveLocationsBySlotId(slotId: string): Promise<Location[]>;
}

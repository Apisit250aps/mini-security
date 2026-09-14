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
  findByCompanyId(companyId: string): Promise<Location[]>;
  findByBranchId(branchId: string): Promise<Location[]>;
  findActiveByBranchId(branchId: string): Promise<Location[]>;
  findPrimaryByBranchId(branchId: string): Promise<Location | null>;
  setPrimaryLocation(
    companyId: string,
    branchId: string,
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

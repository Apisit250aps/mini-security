import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Location, ScheduleSlotLocation } from '#entities/location';
import type {
  CreateLocation,
  CreateScheduleSlotLocation,
  UpdateLocation,
  UpdateScheduleSlotLocation,
} from '#schema/location';

// Context Types
export type ICreateLocationContext = ISecurityContext & {
  data: CreateLocation;
};

export type IUpdateLocationContext = ISecurityContext & {
  id: string;
  data: UpdateLocation;
};

export type IDeleteLocationContext = ISecurityContext & {
  id: string;
  companyId: string;
};

export type IGetLocationContext = ISecurityContext & {
  id: string;
};

export type IGetLocationsByBranchContext = ISecurityContext & {
  companyBranchId: string;
};

export type IGetLocationsByCompanyContext = ISecurityContext & {
  companyId: string;
};

export type ISetPrimaryLocationContext = ISecurityContext & {
  locationId: string;
  companyBranchId: string;
  companyId: string;
};

export type IAssignSlotLocationContext = ISecurityContext & {
  data: CreateScheduleSlotLocation;
};

export type IUpdateSlotLocationContext = ISecurityContext & {
  id: string;
  data: UpdateScheduleSlotLocation;
};

export type IGetSlotLocationsContext = ISecurityContext & {
  scheduleSlotId: string;
};

// Use Case Contracts
export type ICreateLocationUseCase = BaseUseCase<
  ICreateLocationContext,
  Location
>;
export type IUpdateLocationUseCase = BaseUseCase<
  IUpdateLocationContext,
  Location
>;
export type IDeleteLocationUseCase = BaseUseCase<
  IDeleteLocationContext,
  void
>;
export type IGetLocationUseCase = BaseUseCase<
  IGetLocationContext,
  Location | null
>;
export type IGetLocationsByBranchUseCase = BaseUseCase<
  IGetLocationsByBranchContext,
  Location[]
>;
export type IGetLocationsByCompanyUseCase = BaseUseCase<
  IGetLocationsByCompanyContext,
  Location[]
>;
export type ISetPrimaryLocationUseCase = BaseUseCase<
  ISetPrimaryLocationContext,
  Location
>;
export type IAssignSlotLocationUseCase = BaseUseCase<
  IAssignSlotLocationContext,
  ScheduleSlotLocation
>;
export type IUpdateSlotLocationUseCase = BaseUseCase<
  IUpdateSlotLocationContext,
  ScheduleSlotLocation
>;
export type IGetSlotLocationsUseCase = BaseUseCase<
  IGetSlotLocationsContext,
  Location[]
>;

import {
  AssignSlotLocationUseCase,
  CreateLocationUseCase,
  DeleteLocationUseCase,
  GetLocationsByBranchUseCase,
  GetLocationsByCompanyUseCase,
  GetLocationUseCase,
  GetSlotLocationsUseCase,
  SetPrimaryLocationUseCase,
  UpdateLocationUseCase,
  UpdateSlotLocationUseCase,
} from '@repo/applications';
import {
  locationRepository,
  scheduleSlotLocationRepository,
} from '../../repositories';

export const createLocationUseCase = new CreateLocationUseCase(
  locationRepository,
);

export const updateLocationUseCase = new UpdateLocationUseCase(
  locationRepository,
);

export const deleteLocationUseCase = new DeleteLocationUseCase(
  locationRepository,
);

export const getLocationUseCase = new GetLocationUseCase(locationRepository);

export const getLocationsByBranchUseCase = new GetLocationsByBranchUseCase(
  locationRepository,
);

export const getLocationsByCompanyUseCase = new GetLocationsByCompanyUseCase(
  locationRepository,
);

export const setPrimaryLocationUseCase = new SetPrimaryLocationUseCase(
  locationRepository,
);

export const assignSlotLocationUseCase = new AssignSlotLocationUseCase(
  scheduleSlotLocationRepository,
);

export const updateSlotLocationUseCase = new UpdateSlotLocationUseCase(
  scheduleSlotLocationRepository,
);

export const getSlotLocationsUseCase = new GetSlotLocationsUseCase(
  scheduleSlotLocationRepository,
);

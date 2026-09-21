import {
  AssignSlotLocationUseCase,
  CreateLocationUseCase,
  DeleteLocationUseCase,
  GetLocationsBySiteUseCase,
  GetLocationsByOrganizationUseCase,
  GetLocationUseCase,
  GetSlotLocationsUseCase,
  GetSlotLocationAssignmentsUseCase,
  SetPrimaryLocationUseCase,
  UpdateLocationUseCase,
  UpdateSlotLocationUseCase,
} from '@repo/applications';
import {
  locationRepository,
  scheduleSlotRepository,
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

export const getLocationsBySiteUseCase = new GetLocationsBySiteUseCase(
  locationRepository,
);

export const getLocationsByOrganizationUseCase =
  new GetLocationsByOrganizationUseCase(locationRepository);

export const setPrimaryLocationUseCase = new SetPrimaryLocationUseCase(
  locationRepository,
);

export const assignSlotLocationUseCase = new AssignSlotLocationUseCase(
  scheduleSlotLocationRepository,
  scheduleSlotRepository,
  locationRepository,
);

export const updateSlotLocationUseCase = new UpdateSlotLocationUseCase(
  scheduleSlotLocationRepository,
);

export const getSlotLocationsUseCase = new GetSlotLocationsUseCase(
  scheduleSlotLocationRepository,
  scheduleSlotRepository,
);

export const getSlotLocationAssignmentsUseCase =
  new GetSlotLocationAssignmentsUseCase(
    scheduleSlotLocationRepository,
    scheduleSlotRepository,
  );

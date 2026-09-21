import { Hono } from 'hono';
import {
  assignSlotLocationUseCase,
  createLocationUseCase,
  deleteLocationUseCase,
  getLocationUseCase,
  getLocationsBySiteUseCase,
  getLocationsByOrganizationUseCase,
  getSlotLocationsUseCase,
  getSlotLocationAssignmentsUseCase,
  setPrimaryLocationUseCase,
  updateLocationUseCase,
  updateSlotLocationUseCase,
} from '@repo/infrastructures/compositions';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middleware';

const locationController = new LocationController(
  createLocationUseCase,
  updateLocationUseCase,
  deleteLocationUseCase,
  getLocationUseCase,
  getLocationsBySiteUseCase,
  getLocationsByOrganizationUseCase,
  setPrimaryLocationUseCase,
  assignSlotLocationUseCase,
  updateSlotLocationUseCase,
  getSlotLocationsUseCase,
  getSlotLocationAssignmentsUseCase,
);

const locationRoutes = new Hono();

locationRoutes.use('*', authMiddleware);

locationRoutes.get('/', locationController.listLocationsByOrganization);
locationRoutes.get('/site/:siteId', locationController.listLocationsBySite);
locationRoutes.get('/:id', locationController.getLocation);
locationRoutes.post('/', locationController.createLocation);
locationRoutes.put('/:id', locationController.updateLocation);
locationRoutes.delete('/:id', locationController.deleteLocation);
locationRoutes.post('/set-primary', locationController.setPrimaryLocation);
locationRoutes.post('/slots', locationController.assignSlotLocation);
locationRoutes.put('/slots/:id', locationController.updateSlotLocation);
locationRoutes.get(
  '/slots/:slotId/assignments',
  locationController.getSlotLocationAssignments,
);
locationRoutes.get('/slots/:slotId', locationController.getSlotLocations);

export default locationRoutes;

import { z } from 'zod';
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
  createLocationSchema,
  createScheduleSlotLocationSchema,
  updateLocationSchema,
  updateScheduleSlotLocationSchema,
} from '@repo/domains/schema/location';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const siteIdParamSchema = z.object({ siteId: z.string().uuid() });
const slotIdParamSchema = z.object({ slotId: z.string().uuid() });
const organizationIdQuerySchema = z.object({
  organizationId: z.string().uuid(),
});
const deleteQuerySchema = z.object({ organizationId: z.string().uuid() });

const setPrimaryLocationBodySchema = z.object({
  locationId: z.string().uuid(),
  siteId: z.string().uuid(),
});

export class LocationController extends Controller {
  constructor(
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
    private readonly getLocationUseCase: GetLocationUseCase,
    private readonly getLocationsBySiteUseCase: GetLocationsBySiteUseCase,
    private readonly getLocationsByOrganizationUseCase: GetLocationsByOrganizationUseCase,
    private readonly setPrimaryLocationUseCase: SetPrimaryLocationUseCase,
    private readonly assignSlotLocationUseCase: AssignSlotLocationUseCase,
    private readonly updateSlotLocationUseCase: UpdateSlotLocationUseCase,
    private readonly getSlotLocationsUseCase: GetSlotLocationsUseCase,
    private readonly getSlotLocationAssignmentsUseCase: GetSlotLocationAssignmentsUseCase,
  ) {
    super();
  }

  public listLocationsByOrganization = this.validator(
    { query: organizationIdQuerySchema },
    async (c) => {
      const { organizationId } = c.get('query');
      const locations = await this.getLocationsByOrganizationUseCase.execute({
        ...this.securityContext(c),
        organizationId,
      });
      return this.success(c, 'Locations retrieved successfully', locations);
    },
  );

  public listLocationsBySite = this.validator(
    { params: siteIdParamSchema },
    async (c) => {
      const { siteId } = c.get('params');
      const locations = await this.getLocationsBySiteUseCase.execute({
        ...this.securityContext(c),
        siteId,
      });
      return this.success(
        c,
        'Site locations retrieved successfully',
        locations,
      );
    },
  );

  public getLocation = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const location = await this.getLocationUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Location retrieved successfully', location);
  });

  public createLocation = this.validator(
    { body: createLocationSchema },
    async (c) => {
      const body = c.get('body');
      const location = await this.createLocationUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Location created successfully', location);
    },
  );

  public updateLocation = this.validator(
    { params: idParamSchema, body: updateLocationSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const location = await this.updateLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Location updated successfully', location);
    },
  );

  public deleteLocation = this.validator(
    { params: idParamSchema, query: deleteQuerySchema },
    async (c) => {
      const { id } = c.get('params');
      const { organizationId } = c.get('query');
      await this.deleteLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        organizationId,
      });
      return this.success(c, 'Location deleted successfully');
    },
  );

  public setPrimaryLocation = this.validator(
    { body: setPrimaryLocationBodySchema },
    async (c) => {
      const body = c.get('body');
      const security = this.securityContext(c);
      const location = await this.setPrimaryLocationUseCase.execute({
        ...security,
        locationId: body.locationId,
        siteId: body.siteId,
        organizationId:
          security.organizationId ?? security.activeOrganizationId ?? '',
      });
      return this.success(c, 'Primary location set successfully', location);
    },
  );

  public assignSlotLocation = this.validator(
    { body: createScheduleSlotLocationSchema },
    async (c) => {
      const body = c.get('body');
      const slotLocation = await this.assignSlotLocationUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(
        c,
        'Location assigned to slot successfully',
        slotLocation,
      );
    },
  );

  public updateSlotLocation = this.validator(
    { params: idParamSchema, body: updateScheduleSlotLocationSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const slotLocation = await this.updateSlotLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(
        c,
        'Slot location updated successfully',
        slotLocation,
      );
    },
  );

  public getSlotLocations = this.validator(
    { params: slotIdParamSchema },
    async (c) => {
      const { slotId } = c.get('params');
      const locations = await this.getSlotLocationsUseCase.execute({
        ...this.securityContext(c),
        scheduleSlotId: slotId,
      });
      return this.success(
        c,
        'Slot locations retrieved successfully',
        locations,
      );
    },
  );
  public getSlotLocationAssignments = this.validator(
    { params: slotIdParamSchema },
    async (c) => {
      const { slotId } = c.get('params');
      const assignments = await this.getSlotLocationAssignmentsUseCase.execute({
        ...this.securityContext(c),
        scheduleSlotId: slotId,
      });
      return this.success(
        c,
        'Slot location assignments retrieved successfully',
        assignments,
      );
    },
  );
}

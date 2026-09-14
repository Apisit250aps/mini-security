import { z } from 'zod';
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
  createLocationSchema,
  createScheduleSlotLocationSchema,
  updateLocationSchema,
  updateScheduleSlotLocationSchema,
} from '@repo/domains/schema/location';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const branchIdParamSchema = z.object({ branchId: z.string().uuid() });
const slotIdParamSchema = z.object({ slotId: z.string().uuid() });
const companyIdQuerySchema = z.object({ companyId: z.string().uuid() });
const deleteQuerySchema = z.object({ companyId: z.string().uuid() });

const setPrimaryLocationBodySchema = z.object({
  locationId: z.string().uuid(),
  companyBranchId: z.string().uuid(),
});

export class LocationController extends Controller {
  constructor(
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
    private readonly getLocationUseCase: GetLocationUseCase,
    private readonly getLocationsByBranchUseCase: GetLocationsByBranchUseCase,
    private readonly getLocationsByCompanyUseCase: GetLocationsByCompanyUseCase,
    private readonly setPrimaryLocationUseCase: SetPrimaryLocationUseCase,
    private readonly assignSlotLocationUseCase: AssignSlotLocationUseCase,
    private readonly updateSlotLocationUseCase: UpdateSlotLocationUseCase,
    private readonly getSlotLocationsUseCase: GetSlotLocationsUseCase,
  ) {
    super();
  }

  public listLocationsByCompany = this.validator(
    { query: companyIdQuerySchema },
    async (c) => {
      const { companyId } = c.get('query');
      const locations = await this.getLocationsByCompanyUseCase.execute({
        ...this.securityContext(c),
        companyId,
      });
      return this.success(c, 'Locations retrieved successfully', locations);
    },
  );

  public listLocationsByBranch = this.validator(
    { params: branchIdParamSchema },
    async (c) => {
      const { branchId } = c.get('params');
      const locations = await this.getLocationsByBranchUseCase.execute({
        ...this.securityContext(c),
        companyBranchId: branchId,
      });
      return this.success(
        c,
        'Branch locations retrieved successfully',
        locations,
      );
    },
  );

  public getLocation = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const location = await this.getLocationUseCase.execute({
        ...this.securityContext(c),
        id,
      });
      return this.success(c, 'Location retrieved successfully', location);
    },
  );

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
      const { companyId } = c.get('query');
      await this.deleteLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        companyId,
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
        companyBranchId: body.companyBranchId,
        companyId: security.companyId ?? security.activeCompanyId ?? '',
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
}

import { z } from 'zod';
import {
  CheckInAttendanceUseCase,
  CreateCheckInScheduleUseCase,
  CreateScheduleSlotUseCase,
  DeleteScheduleSlotUseCase,
  GetAttendanceLogsByOrganizationUseCase,
  GetAttendanceLogsByMemberUseCase,
  GetCheckInSchedulesByRoleUseCase,
  GetCheckInSchedulesByOrganizationUseCase,
  GetScheduleSlotsByScheduleUseCase,
  ManualCheckInAttendanceUseCase,
  UpdateCheckInScheduleUseCase,
  UpdateScheduleSlotUseCase,
} from '@repo/applications';
import {
  createAttendanceLogSchema,
  createCheckInScheduleSchema,
  createScheduleSlotSchema,
  updateCheckInScheduleSchema,
  updateScheduleSlotSchema,
} from '@repo/domains/schema/attendance';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const roleIdParamSchema = z.object({
  organizationId: z.string().uuid(),
  roleId: z.string().uuid(),
});
const organizationIdParamSchema = z.object({
  organizationId: z.string().uuid(),
});
const scheduleIdParamSchema = z.object({ scheduleId: z.string().uuid() });
const memberIdParamSchema = z.object({ memberId: z.string().uuid() });

const checkInBodySchema = z.object({
  organizationMemberId: z.string().uuid(),
  scheduleSlotId: z.string().uuid(),
  note: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationId: z.string().uuid().optional(),
});

const memberLogsQuerySchema = z.object({
  workDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const organizationLogsQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export class AttendanceController extends Controller {
  constructor(
    private readonly createCheckInScheduleUseCase: CreateCheckInScheduleUseCase,
    private readonly updateCheckInScheduleUseCase: UpdateCheckInScheduleUseCase,
    private readonly getCheckInSchedulesByRoleUseCase: GetCheckInSchedulesByRoleUseCase,
    private readonly getCheckInSchedulesByOrganizationUseCase: GetCheckInSchedulesByOrganizationUseCase,
    private readonly createScheduleSlotUseCase: CreateScheduleSlotUseCase,
    private readonly updateScheduleSlotUseCase: UpdateScheduleSlotUseCase,
    private readonly deleteScheduleSlotUseCase: DeleteScheduleSlotUseCase,
    private readonly getScheduleSlotsByScheduleUseCase: GetScheduleSlotsByScheduleUseCase,
    private readonly checkInAttendanceUseCase: CheckInAttendanceUseCase,
    private readonly manualCheckInAttendanceUseCase: ManualCheckInAttendanceUseCase,
    private readonly getAttendanceLogsByMemberUseCase: GetAttendanceLogsByMemberUseCase,
    private readonly getAttendanceLogsByOrganizationUseCase: GetAttendanceLogsByOrganizationUseCase,
  ) {
    super();
  }

  // --- Check-In Schedules ---

  public createSchedule = this.validator(
    { body: createCheckInScheduleSchema },
    async (c) => {
      const body = c.get('body');
      const schedule = await this.createCheckInScheduleUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Schedule created successfully', schedule);
    },
  );

  public updateSchedule = this.validator(
    { params: idParamSchema, body: updateCheckInScheduleSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const schedule = await this.updateCheckInScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Schedule updated successfully', schedule);
    },
  );

  public getSchedulesByRole = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { organizationId, roleId } = c.get('params');
      const schedule = await this.getCheckInSchedulesByRoleUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        roleId,
      });
      return this.success(c, 'Schedule retrieved successfully', schedule);
    },
  );

  public getSchedulesByOrganization = this.validator(
    { params: organizationIdParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const schedules =
        await this.getCheckInSchedulesByOrganizationUseCase.execute({
          ...this.securityContext(c),
          organizationId,
        });
      return this.success(c, 'Schedules retrieved successfully', schedules);
    },
  );

  // --- Schedule Slots ---

  public createSlot = this.validator(
    {
      params: scheduleIdParamSchema,
      body: createScheduleSlotSchema.omit({ checkInScheduleId: true }),
    },
    async (c) => {
      const { scheduleId } = c.get('params');
      const body = c.get('body');
      const slot = await this.createScheduleSlotUseCase.execute({
        ...this.securityContext(c),
        data: {
          ...body,
          checkInScheduleId: scheduleId,
        },
      });
      return this.created(c, 'Schedule slot created successfully', slot);
    },
  );

  public updateSlot = this.validator(
    { params: idParamSchema, body: updateScheduleSlotSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const slot = await this.updateScheduleSlotUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Schedule slot updated successfully', slot);
    },
  );

  public deleteSlot = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    await this.deleteScheduleSlotUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Schedule slot deleted successfully');
  });

  public getSlotsBySchedule = this.validator(
    { params: scheduleIdParamSchema },
    async (c) => {
      const { scheduleId } = c.get('params');
      const slots = await this.getScheduleSlotsByScheduleUseCase.execute({
        ...this.securityContext(c),
        checkInScheduleId: scheduleId,
      });
      return this.success(c, 'Schedule slots retrieved successfully', slots);
    },
  );

  // --- Attendance Logs ---

  public checkIn = this.validator({ body: checkInBodySchema }, async (c) => {
    const body = c.get('body');
    const log = await this.checkInAttendanceUseCase.execute({
      ...this.securityContext(c),
      organizationMemberId: body.organizationMemberId,
      scheduleSlotId: body.scheduleSlotId,
      note: body.note,
      latitude: body.latitude,
      longitude: body.longitude,
      locationId: body.locationId,
    });
    return this.success(c, 'Check-in recorded successfully', log);
  });

  public manualCheckIn = this.validator(
    { body: createAttendanceLogSchema },
    async (c) => {
      const body = c.get('body');
      const log = await this.manualCheckInAttendanceUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Manual check-in recorded successfully', log);
    },
  );

  public getMemberLogs = this.validator(
    { params: memberIdParamSchema, query: memberLogsQuerySchema },
    async (c) => {
      const { memberId } = c.get('params');
      const query = c.get('query');
      const logs = await this.getAttendanceLogsByMemberUseCase.execute({
        ...this.securityContext(c),
        organizationMemberId: memberId,
        workDate: query?.workDate,
        startDate: query?.startDate,
        endDate: query?.endDate,
      });
      return this.success(c, 'Attendance logs retrieved successfully', logs);
    },
  );

  public getOrganizationLogs = this.validator(
    { params: organizationIdParamSchema, query: organizationLogsQuerySchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const query = c.get('query');
      const logs = await this.getAttendanceLogsByOrganizationUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      return this.success(
        c,
        'Organization attendance logs retrieved successfully',
        logs,
      );
    },
  );
}

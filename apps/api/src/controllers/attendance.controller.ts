import { z } from 'zod';
import {
  attendanceRecordSchema,
  createAttendanceCheckpointSchema,
  createAttendanceLocationSchema,
  createAttendanceLogSchema,
  createAttendancePolicySchema,
  createAttendanceRecordSchema,
  createCheckpointLocationSchema,
  createLeaveRequestSchema,
  createRoleAttendancePolicySchema,
  createRoleWorkScheduleSchema,
  createWorkScheduleSchema,
  createWorkShiftSchema,
  updateAttendanceCheckpointSchema,
  updateAttendanceLocationSchema,
  updateAttendanceLogSchema,
  updateAttendancePolicySchema,
  updateAttendanceRecordSchema,
  updateLeaveRequestSchema,
  updateRoleWorkScheduleSchema,
  updateWorkScheduleSchema,
  updateWorkShiftSchema,
} from '@repo/domains/schema/attendance';
import type {
  ApproveAttendanceRecordUseCase,
  AssignCheckpointLocationUseCase,
  AssignRoleAttendancePolicyUseCase,
  AssignRoleWorkScheduleUseCase,
  CreateAttendanceCheckpointUseCase,
  CreateAttendanceLocationUseCase,
  CreateAttendanceLogUseCase,
  CreateAttendancePolicyUseCase,
  CreateAttendanceRecordUseCase,
  CreateLeaveRequestUseCase,
  CreateWorkScheduleUseCase,
  CreateWorkShiftUseCase,
  DeleteAttendanceCheckpointUseCase,
  DeleteAttendanceLocationUseCase,
  DeleteAttendanceLogUseCase,
  DeleteAttendancePolicyUseCase,
  DeleteAttendanceRecordUseCase,
  DeleteLeaveRequestUseCase,
  DeleteRoleWorkScheduleUseCase,
  DeleteWorkScheduleUseCase,
  DeleteWorkShiftUseCase,
  GetAttendanceCheckpointUseCase,
  GetAttendanceCheckpointsUseCase,
  GetAttendanceLocationsUseCase,
  GetAttendanceLocationUseCase,
  GetAttendanceLogsByRecordUseCase,
  GetAttendanceLogUseCase,
  GetAttendancePoliciesUseCase,
  GetAttendancePolicyUseCase,
  GetAttendanceRecordsUseCase,
  GetAttendanceRecordUseCase,
  GetCheckpointLocationsUseCase,
  GetCurrentRoleWorkScheduleUseCase,
  GetLeaveRequestsUseCase,
  GetLeaveRequestUseCase,
  GetMemberAttendanceRecordByDateUseCase,
  GetRoleAttendancePoliciesUseCase,
  GetRoleWorkSchedulesByCompanyUseCase,
  GetRoleWorkScheduleUseCase,
  GetWorkSchedulesUseCase,
  GetWorkScheduleUseCase,
  GetWorkShiftsUseCase,
  GetWorkShiftUseCase,
  GetCompanyWorkShiftsUseCase,
  RemoveCheckpointLocationUseCase,
  RemoveRoleAttendancePolicyUseCase,
  ReviewLeaveRequestUseCase,
  UpdateAttendanceCheckpointUseCase,
  UpdateAttendanceLocationUseCase,
  UpdateAttendanceLogUseCase,
  UpdateAttendancePolicyUseCase,
  UpdateAttendanceRecordUseCase,
  UpdateLeaveRequestUseCase,
  UpdateRoleWorkScheduleUseCase,
  UpdateWorkScheduleUseCase,
  UpdateWorkShiftUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = attendanceRecordSchema.pick({ id: true });

const companyIdParamSchema = createWorkScheduleSchema.pick({ companyId: true });

const workScheduleIdParamSchema = createWorkShiftSchema.pick({
  workScheduleId: true,
});

const policyIdParamSchema = createAttendanceCheckpointSchema.pick({
  policyId: true,
});

const roleIdParamSchema = createRoleAttendancePolicySchema.pick({
  roleId: true,
});

const rolePolicyParamSchema = createRoleAttendancePolicySchema.pick({
  roleId: true,
  policyId: true,
});

const checkpointIdParamSchema = createCheckpointLocationSchema.pick({
  checkpointId: true,
});

const checkpointLocationParamSchema = createCheckpointLocationSchema.pick({
  checkpointId: true,
  locationId: true,
});

const recordIdParamSchema = createAttendanceLogSchema.pick({
  attendanceRecordId: true,
});

const attendanceRecordQuerySchema = z.object({
  companyId: createWorkScheduleSchema.shape.companyId,
  memberId: createAttendanceRecordSchema.shape.companyMemberId.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const memberDateQuerySchema = z.object({
  companyMemberId: createAttendanceRecordSchema.shape.companyMemberId,
  workDate: z.string(),
});

const leaveRequestQuerySchema = z.object({
  companyId: createWorkScheduleSchema.shape.companyId,
  memberId: createAttendanceRecordSchema.shape.companyMemberId.optional(),
  status: createLeaveRequestSchema.shape.status.optional(),
});

const approveRecordBodySchema = z.object({
  status: createAttendanceRecordSchema.shape.status,
  note: createAttendanceRecordSchema.shape.note.unwrap(),
});

const reviewLeaveBodySchema = z.object({
  status: createLeaveRequestSchema.shape.status,
  reviewNote: createLeaveRequestSchema.shape.reviewNote.unwrap(),
});

export class AttendanceController extends Controller {
  constructor(
    // Work Schedule & Shift
    private readonly createWorkScheduleUseCase: CreateWorkScheduleUseCase,
    private readonly updateWorkScheduleUseCase: UpdateWorkScheduleUseCase,
    private readonly deleteWorkScheduleUseCase: DeleteWorkScheduleUseCase,
    private readonly getWorkScheduleUseCase: GetWorkScheduleUseCase,
    private readonly getWorkSchedulesUseCase: GetWorkSchedulesUseCase,
    private readonly createWorkShiftUseCase: CreateWorkShiftUseCase,
    private readonly updateWorkShiftUseCase: UpdateWorkShiftUseCase,
    private readonly deleteWorkShiftUseCase: DeleteWorkShiftUseCase,
    private readonly getWorkShiftUseCase: GetWorkShiftUseCase,
    private readonly getWorkShiftsUseCase: GetWorkShiftsUseCase,
    private readonly getCompanyWorkShiftsUseCase: GetCompanyWorkShiftsUseCase,

    // Policy & Checkpoint
    private readonly createAttendancePolicyUseCase: CreateAttendancePolicyUseCase,
    private readonly updateAttendancePolicyUseCase: UpdateAttendancePolicyUseCase,
    private readonly deleteAttendancePolicyUseCase: DeleteAttendancePolicyUseCase,
    private readonly getAttendancePolicyUseCase: GetAttendancePolicyUseCase,
    private readonly getAttendancePoliciesUseCase: GetAttendancePoliciesUseCase,
    private readonly createAttendanceCheckpointUseCase: CreateAttendanceCheckpointUseCase,
    private readonly updateAttendanceCheckpointUseCase: UpdateAttendanceCheckpointUseCase,
    private readonly deleteAttendanceCheckpointUseCase: DeleteAttendanceCheckpointUseCase,
    private readonly getAttendanceCheckpointUseCase: GetAttendanceCheckpointUseCase,
    private readonly getAttendanceCheckpointsUseCase: GetAttendanceCheckpointsUseCase,
    private readonly assignRoleAttendancePolicyUseCase: AssignRoleAttendancePolicyUseCase,
    private readonly removeRoleAttendancePolicyUseCase: RemoveRoleAttendancePolicyUseCase,
    private readonly getRoleAttendancePoliciesUseCase: GetRoleAttendancePoliciesUseCase,

    // Location
    private readonly createAttendanceLocationUseCase: CreateAttendanceLocationUseCase,
    private readonly updateAttendanceLocationUseCase: UpdateAttendanceLocationUseCase,
    private readonly deleteAttendanceLocationUseCase: DeleteAttendanceLocationUseCase,
    private readonly getAttendanceLocationUseCase: GetAttendanceLocationUseCase,
    private readonly getAttendanceLocationsUseCase: GetAttendanceLocationsUseCase,
    private readonly assignCheckpointLocationUseCase: AssignCheckpointLocationUseCase,
    private readonly removeCheckpointLocationUseCase: RemoveCheckpointLocationUseCase,
    private readonly getCheckpointLocationsUseCase: GetCheckpointLocationsUseCase,

    // Role Schedule
    private readonly assignRoleWorkScheduleUseCase: AssignRoleWorkScheduleUseCase,
    private readonly updateRoleWorkScheduleUseCase: UpdateRoleWorkScheduleUseCase,
    private readonly deleteRoleWorkScheduleUseCase: DeleteRoleWorkScheduleUseCase,
    private readonly getRoleWorkScheduleUseCase: GetRoleWorkScheduleUseCase,
    private readonly getRoleWorkSchedulesByCompanyUseCase: GetRoleWorkSchedulesByCompanyUseCase,
    private readonly getCurrentRoleWorkScheduleUseCase: GetCurrentRoleWorkScheduleUseCase,

    // Attendance Record
    private readonly createAttendanceRecordUseCase: CreateAttendanceRecordUseCase,
    private readonly updateAttendanceRecordUseCase: UpdateAttendanceRecordUseCase,
    private readonly deleteAttendanceRecordUseCase: DeleteAttendanceRecordUseCase,
    private readonly getAttendanceRecordUseCase: GetAttendanceRecordUseCase,
    private readonly getAttendanceRecordsUseCase: GetAttendanceRecordsUseCase,
    private readonly getMemberAttendanceRecordByDateUseCase: GetMemberAttendanceRecordByDateUseCase,
    private readonly approveAttendanceRecordUseCase: ApproveAttendanceRecordUseCase,

    // Attendance Log
    private readonly createAttendanceLogUseCase: CreateAttendanceLogUseCase,
    private readonly updateAttendanceLogUseCase: UpdateAttendanceLogUseCase,
    private readonly deleteAttendanceLogUseCase: DeleteAttendanceLogUseCase,
    private readonly getAttendanceLogUseCase: GetAttendanceLogUseCase,
    private readonly getAttendanceLogsByRecordUseCase: GetAttendanceLogsByRecordUseCase,

    // Leave Request
    private readonly createLeaveRequestUseCase: CreateLeaveRequestUseCase,
    private readonly updateLeaveRequestUseCase: UpdateLeaveRequestUseCase,
    private readonly deleteLeaveRequestUseCase: DeleteLeaveRequestUseCase,
    private readonly getLeaveRequestUseCase: GetLeaveRequestUseCase,
    private readonly getLeaveRequestsUseCase: GetLeaveRequestsUseCase,
    private readonly reviewLeaveRequestUseCase: ReviewLeaveRequestUseCase,
  ) {
    super();
  }

  // ==========================================
  // Work Schedule Endpoints
  // ==========================================

  public getWorkSchedules = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getWorkSchedulesUseCase.execute({
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Work schedules retrieved', result);
    },
  );

  public getWorkSchedule = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Work schedule retrieved', result);
    },
  );

  public createWorkSchedule = this.validator(
    { body: createWorkScheduleSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Work schedule created', result);
    },
  );

  public updateWorkSchedule = this.validator(
    { params: idParamSchema, body: updateWorkScheduleSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Work schedule updated', result);
    },
  );

  public deleteWorkSchedule = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Work schedule deleted', null);
    },
  );

  // ==========================================
  // Work Shift Endpoints
  // ==========================================

  public getWorkShifts = this.validator(
    { params: workScheduleIdParamSchema },
    async (c) => {
      const { workScheduleId } = c.get('params');
      const user = c.get('user');
      const result = await this.getWorkShiftsUseCase.execute({
        ...this.securityContext(c),
        workScheduleId,
        userId: user?.id,
      });
      return this.success(c, 'Work shifts retrieved', result);
    },
  );

  public getCompanyWorkShifts = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getCompanyWorkShiftsUseCase.execute({
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Company work shifts retrieved', result);
    },
  );

  public getWorkShift = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    const result = await this.getWorkShiftUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'Work shift retrieved', result);
  });

  public createWorkShift = this.validator(
    { body: createWorkShiftSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createWorkShiftUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Work shift created', result);
    },
  );

  public updateWorkShift = this.validator(
    { params: idParamSchema, body: updateWorkShiftSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateWorkShiftUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Work shift updated', result);
    },
  );

  public deleteWorkShift = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteWorkShiftUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Work shift deleted', null);
    },
  );

  // ==========================================
  // Attendance Policy Endpoints
  // ==========================================

  public getAttendancePolicies = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendancePoliciesUseCase.execute({
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Attendance policies retrieved', result);
    },
  );

  public getAttendancePolicy = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance policy retrieved', result);
    },
  );

  public createAttendancePolicy = this.validator(
    { body: createAttendancePolicySchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Attendance policy created', result);
    },
  );

  public updateAttendancePolicy = this.validator(
    { params: idParamSchema, body: updateAttendancePolicySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Attendance policy updated', result);
    },
  );

  public deleteAttendancePolicy = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance policy deleted', null);
    },
  );

  // ==========================================
  // Attendance Checkpoint Endpoints
  // ==========================================

  public getAttendanceCheckpoints = this.validator(
    { params: policyIdParamSchema },
    async (c) => {
      const { policyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceCheckpointsUseCase.execute({
        ...this.securityContext(c),
        policyId,
        userId: user?.id,
      });
      return this.success(c, 'Attendance checkpoints retrieved', result);
    },
  );

  public getAttendanceCheckpoint = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceCheckpointUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance checkpoint retrieved', result);
    },
  );

  public createAttendanceCheckpoint = this.validator(
    { body: createAttendanceCheckpointSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createAttendanceCheckpointUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Attendance checkpoint created', result);
    },
  );

  public updateAttendanceCheckpoint = this.validator(
    { params: idParamSchema, body: updateAttendanceCheckpointSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateAttendanceCheckpointUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Attendance checkpoint updated', result);
    },
  );

  public deleteAttendanceCheckpoint = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteAttendanceCheckpointUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance checkpoint deleted', null);
    },
  );

  // ==========================================
  // Role Attendance Policy Endpoints
  // ==========================================

  public getRoleAttendancePolicies = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const user = c.get('user');
      const result = await this.getRoleAttendancePoliciesUseCase.execute({
        ...this.securityContext(c),
        roleId,
        userId: user?.id,
      });
      return this.success(c, 'Role attendance policies retrieved', result);
    },
  );

  public assignRoleAttendancePolicy = this.validator(
    { body: createRoleAttendancePolicySchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignRoleAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Role attendance policy assigned', result);
    },
  );

  public removeRoleAttendancePolicy = this.validator(
    { params: rolePolicyParamSchema },
    async (c) => {
      const { roleId, policyId } = c.get('params');
      const user = c.get('user');
      await this.removeRoleAttendancePolicyUseCase.execute({
        ...this.securityContext(c),
        roleId,
        policyId,
        userId: user?.id,
      });
      return this.success(c, 'Role attendance policy removed', null);
    },
  );

  // ==========================================
  // Attendance Location Endpoints
  // ==========================================

  public getAttendanceLocations = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceLocationsUseCase.execute({
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Attendance locations retrieved', result);
    },
  );

  public getAttendanceLocation = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance location retrieved', result);
    },
  );

  public createAttendanceLocation = this.validator(
    { body: createAttendanceLocationSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createAttendanceLocationUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Attendance location created', result);
    },
  );

  public updateAttendanceLocation = this.validator(
    { params: idParamSchema, body: updateAttendanceLocationSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateAttendanceLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Attendance location updated', result);
    },
  );

  public deleteAttendanceLocation = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteAttendanceLocationUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance location deleted', null);
    },
  );

  public getCheckpointLocations = this.validator(
    { params: checkpointIdParamSchema },
    async (c) => {
      const { checkpointId } = c.get('params');
      const user = c.get('user');
      const result = await this.getCheckpointLocationsUseCase.execute({
        ...this.securityContext(c),
        checkpointId,
        userId: user?.id,
      });
      return this.success(c, 'Checkpoint locations retrieved', result);
    },
  );

  public assignCheckpointLocation = this.validator(
    { body: createCheckpointLocationSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignCheckpointLocationUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Checkpoint location assigned', result);
    },
  );

  public removeCheckpointLocation = this.validator(
    { params: checkpointLocationParamSchema },
    async (c) => {
      const { checkpointId, locationId } = c.get('params');
      const user = c.get('user');
      await this.removeCheckpointLocationUseCase.execute({
        ...this.securityContext(c),
        checkpointId,
        locationId,
        userId: user?.id,
      });
      return this.success(c, 'Checkpoint location removed', null);
    },
  );

  // ==========================================
  // Role Work Schedule Endpoints
  // ==========================================

  public getRoleWorkSchedulesByCompany = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = c.get('user');
      const result = await this.getRoleWorkSchedulesByCompanyUseCase.execute({
        ...this.securityContext(c),
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Role work schedules retrieved', result);
    },
  );

  public getCurrentRoleWorkSchedule = this.validator(
    { params: roleIdParamSchema },
    async (c) => {
      const { roleId } = c.get('params');
      const user = c.get('user');
      const result = await this.getCurrentRoleWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        roleId,
        userId: user?.id,
      });
      return this.success(c, 'Current role work schedule retrieved', result);
    },
  );

  public assignRoleWorkSchedule = this.validator(
    { body: createRoleWorkScheduleSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.assignRoleWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Role work schedule assigned', result);
    },
  );

  public updateRoleWorkSchedule = this.validator(
    { params: idParamSchema, body: updateRoleWorkScheduleSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateRoleWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Role work schedule updated', result);
    },
  );

  public deleteRoleWorkSchedule = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteRoleWorkScheduleUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Role work schedule deleted', null);
    },
  );

  // ==========================================
  // Attendance Record Endpoints
  // ==========================================

  public getAttendanceRecords = this.validator(
    { query: attendanceRecordQuerySchema },
    async (c) => {
      const query = c.get('query');
      const user = c.get('user');
      const result = await this.getAttendanceRecordsUseCase.execute({
        ...this.securityContext(c),
        companyId: query.companyId,
        memberId: query.memberId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        userId: user?.id,
      });
      return this.success(c, 'Attendance records retrieved', result);
    },
  );

  public getAttendanceRecord = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceRecordUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance record retrieved', result);
    },
  );

  public getMemberAttendanceRecordByDate = this.validator(
    { query: memberDateQuerySchema },
    async (c) => {
      const query = c.get('query');
      const user = c.get('user');
      const result = await this.getMemberAttendanceRecordByDateUseCase.execute({
        ...this.securityContext(c),
        companyMemberId: query.companyMemberId,
        workDate: new Date(query.workDate),
        userId: user?.id,
      });
      return this.success(c, 'Attendance record retrieved', result);
    },
  );

  public createAttendanceRecord = this.validator(
    { body: createAttendanceRecordSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createAttendanceRecordUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Attendance record created', result);
    },
  );

  public updateAttendanceRecord = this.validator(
    { params: idParamSchema, body: updateAttendanceRecordSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateAttendanceRecordUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Attendance record updated', result);
    },
  );

  public deleteAttendanceRecord = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteAttendanceRecordUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance record deleted', null);
    },
  );

  public approveAttendanceRecord = this.validator(
    { params: idParamSchema, body: approveRecordBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.approveAttendanceRecordUseCase.execute({
        ...this.securityContext(c),
        id,
        approvedBy: user?.id ?? '',
        status: body.status,
        note: body.note,
        userId: user?.id,
      });
      return this.success(c, 'Attendance record approved', result);
    },
  );

  // ==========================================
  // Attendance Log Endpoints
  // ==========================================

  public getAttendanceLogsByRecord = this.validator(
    { params: recordIdParamSchema },
    async (c) => {
      const { attendanceRecordId } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceLogsByRecordUseCase.execute({
        ...this.securityContext(c),
        attendanceRecordId,
        userId: user?.id,
      });
      return this.success(c, 'Attendance logs retrieved', result);
    },
  );

  public getAttendanceLog = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getAttendanceLogUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance log retrieved', result);
    },
  );

  public createAttendanceLog = this.validator(
    { body: createAttendanceLogSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createAttendanceLogUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Attendance check-in logged', result);
    },
  );

  public updateAttendanceLog = this.validator(
    { params: idParamSchema, body: updateAttendanceLogSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateAttendanceLogUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Attendance log updated', result);
    },
  );

  public deleteAttendanceLog = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteAttendanceLogUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Attendance log deleted', null);
    },
  );

  // ==========================================
  // Leave Request Endpoints
  // ==========================================

  public getLeaveRequests = this.validator(
    { query: leaveRequestQuerySchema },
    async (c) => {
      const query = c.get('query');
      const user = c.get('user');
      const result = await this.getLeaveRequestsUseCase.execute({
        ...this.securityContext(c),
        companyId: query.companyId,
        memberId: query.memberId,
        status: query.status,
        userId: user?.id,
      });
      return this.success(c, 'Leave requests retrieved', result);
    },
  );

  public getLeaveRequest = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const result = await this.getLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Leave request retrieved', result);
    },
  );

  public createLeaveRequest = this.validator(
    { body: createLeaveRequestSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.createLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Leave request created', result);
    },
  );

  public updateLeaveRequest = this.validator(
    { params: idParamSchema, body: updateLeaveRequestSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.updateLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Leave request updated', result);
    },
  );

  public deleteLeaveRequest = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
      });
      return this.success(c, 'Leave request deleted', null);
    },
  );

  public reviewLeaveRequest = this.validator(
    { params: idParamSchema, body: reviewLeaveBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const result = await this.reviewLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
        reviewedBy: user?.id ?? '',
        status: body.status,
        reviewNote: body.reviewNote,
        userId: user?.id,
      });
      return this.success(c, 'Leave request reviewed', result);
    },
  );
}

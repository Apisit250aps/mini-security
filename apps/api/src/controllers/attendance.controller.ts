/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import {
  createAttendanceCheckpointSchema,
  createAttendanceLocationSchema,
  createAttendanceLogSchema,
  createAttendancePolicySchema,
  createAttendanceRecordSchema,
  createCheckpointLocationSchema,
  createLeaveRequestSchema,
  createMemberWorkScheduleSchema,
  createRoleAttendancePolicySchema,
  createWorkScheduleSchema,
  createWorkShiftSchema,
  updateAttendanceCheckpointSchema,
  updateAttendanceLocationSchema,
  updateAttendanceLogSchema,
  updateAttendancePolicySchema,
  updateAttendanceRecordSchema,
  updateLeaveRequestSchema,
  updateMemberWorkScheduleSchema,
  updateWorkScheduleSchema,
  updateWorkShiftSchema,
} from '@repo/domains/schema/attendance';
import type {
  ApproveAttendanceRecordUseCase,
  AssignCheckpointLocationUseCase,
  AssignMemberWorkScheduleUseCase,
  AssignRoleAttendancePolicyUseCase,
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
  DeleteMemberWorkScheduleUseCase,
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
  GetCurrentMemberWorkScheduleUseCase,
  GetLeaveRequestsUseCase,
  GetLeaveRequestUseCase,
  GetMemberAttendanceRecordByDateUseCase,
  GetMemberWorkSchedulesUseCase,
  GetMemberWorkScheduleUseCase,
  GetRoleAttendancePoliciesUseCase,
  GetWorkSchedulesUseCase,
  GetWorkScheduleUseCase,
  GetWorkShiftsUseCase,
  GetWorkShiftUseCase,
  RemoveCheckpointLocationUseCase,
  RemoveRoleAttendancePolicyUseCase,
  ReviewLeaveRequestUseCase,
  UpdateAttendanceCheckpointUseCase,
  UpdateAttendanceLocationUseCase,
  UpdateAttendanceLogUseCase,
  UpdateAttendancePolicyUseCase,
  UpdateAttendanceRecordUseCase,
  UpdateLeaveRequestUseCase,
  UpdateMemberWorkScheduleUseCase,
  UpdateWorkScheduleUseCase,
  UpdateWorkShiftUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const companyIdParamSchema = z.object({
  companyId: z.string().uuid(),
});

const workScheduleIdParamSchema = z.object({
  workScheduleId: z.string().uuid(),
});

const policyIdParamSchema = z.object({
  policyId: z.string().uuid(),
});

const roleIdParamSchema = z.object({
  roleId: z.string().uuid(),
});

const rolePolicyParamSchema = z.object({
  roleId: z.string().uuid(),
  policyId: z.string().uuid(),
});

const checkpointIdParamSchema = z.object({
  checkpointId: z.string().uuid(),
});

const checkpointLocationParamSchema = z.object({
  checkpointId: z.string().uuid(),
  locationId: z.string().uuid(),
});

const memberParamSchema = z.object({
  companyMemberId: z.string().uuid(),
});

const recordIdParamSchema = z.object({
  attendanceRecordId: z.string().uuid(),
});

const attendanceRecordQuerySchema = z.object({
  companyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const memberDateQuerySchema = z.object({
  companyMemberId: z.string().uuid(),
  workDate: z.string(),
});

const leaveRequestQuerySchema = z.object({
  companyId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  status: z.string().optional(),
});

const approveRecordBodySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'LATE', 'ABSENT']),
  note: z.string().optional(),
});

const reviewLeaveBodySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
  reviewNote: z.string().optional(),
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

    // Member Schedule
    private readonly assignMemberWorkScheduleUseCase: AssignMemberWorkScheduleUseCase,
    private readonly updateMemberWorkScheduleUseCase: UpdateMemberWorkScheduleUseCase,
    private readonly deleteMemberWorkScheduleUseCase: DeleteMemberWorkScheduleUseCase,
    private readonly getMemberWorkScheduleUseCase: GetMemberWorkScheduleUseCase,
    private readonly getMemberWorkSchedulesUseCase: GetMemberWorkSchedulesUseCase,
    private readonly getCurrentMemberWorkScheduleUseCase: GetCurrentMemberWorkScheduleUseCase,

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
      const user = (c as any).get('user');
      const result = await this.getWorkSchedulesUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getWorkScheduleUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createWorkScheduleUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateWorkScheduleUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteWorkScheduleUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getWorkShiftsUseCase.execute({
        workScheduleId,
        userId: user?.id,
      });
      return this.success(c, 'Work shifts retrieved', result);
    },
  );

  public getWorkShift = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = (c as any).get('user');
    const result = await this.getWorkShiftUseCase.execute({
      id,
      userId: user?.id,
    });
    return this.success(c, 'Work shift retrieved', result);
  });

  public createWorkShift = this.validator(
    { body: createWorkShiftSchema },
    async (c) => {
      const body = c.get('body');
      const user = (c as any).get('user');
      const result = await this.createWorkShiftUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateWorkShiftUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteWorkShiftUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendancePoliciesUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceCheckpointsUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceCheckpointUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createAttendanceCheckpointUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateAttendanceCheckpointUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteAttendanceCheckpointUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getRoleAttendancePoliciesUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.assignRoleAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      await this.removeRoleAttendancePolicyUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceLocationsUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceLocationUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createAttendanceLocationUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateAttendanceLocationUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteAttendanceLocationUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getCheckpointLocationsUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.assignCheckpointLocationUseCase.execute({
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
      const user = (c as any).get('user');
      await this.removeCheckpointLocationUseCase.execute({
        checkpointId,
        locationId,
        userId: user?.id,
      });
      return this.success(c, 'Checkpoint location removed', null);
    },
  );

  // ==========================================
  // Member Work Schedule Endpoints
  // ==========================================

  public getMemberWorkSchedules = this.validator(
    { params: memberParamSchema },
    async (c) => {
      const { companyMemberId } = c.get('params');
      const user = (c as any).get('user');
      const result = await this.getMemberWorkSchedulesUseCase.execute({
        companyMemberId,
        userId: user?.id,
      });
      return this.success(c, 'Member work schedules retrieved', result);
    },
  );

  public getCurrentMemberWorkSchedule = this.validator(
    { params: memberParamSchema },
    async (c) => {
      const { companyMemberId } = c.get('params');
      const user = (c as any).get('user');
      const result = await this.getCurrentMemberWorkScheduleUseCase.execute({
        companyMemberId,
        userId: user?.id,
      });
      return this.success(c, 'Current member work schedule retrieved', result);
    },
  );

  public assignMemberWorkSchedule = this.validator(
    { body: createMemberWorkScheduleSchema },
    async (c) => {
      const body = c.get('body');
      const user = (c as any).get('user');
      const result = await this.assignMemberWorkScheduleUseCase.execute({
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Member work schedule assigned', result);
    },
  );

  public updateMemberWorkSchedule = this.validator(
    { params: idParamSchema, body: updateMemberWorkScheduleSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = (c as any).get('user');
      const result = await this.updateMemberWorkScheduleUseCase.execute({
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Member work schedule updated', result);
    },
  );

  public deleteMemberWorkSchedule = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = (c as any).get('user');
      await this.deleteMemberWorkScheduleUseCase.execute({
        id,
        userId: user?.id,
      });
      return this.success(c, 'Member work schedule deleted', null);
    },
  );

  // ==========================================
  // Attendance Record Endpoints
  // ==========================================

  public getAttendanceRecords = this.validator(
    { query: attendanceRecordQuerySchema },
    async (c) => {
      const query = c.get('query');
      const user = (c as any).get('user');
      const result = await this.getAttendanceRecordsUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceRecordUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getMemberAttendanceRecordByDateUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createAttendanceRecordUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateAttendanceRecordUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteAttendanceRecordUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.approveAttendanceRecordUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceLogsByRecordUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getAttendanceLogUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createAttendanceLogUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateAttendanceLogUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteAttendanceLogUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getLeaveRequestsUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.getLeaveRequestUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.createLeaveRequestUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.updateLeaveRequestUseCase.execute({
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
      const user = (c as any).get('user');
      await this.deleteLeaveRequestUseCase.execute({
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
      const user = (c as any).get('user');
      const result = await this.reviewLeaveRequestUseCase.execute({
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

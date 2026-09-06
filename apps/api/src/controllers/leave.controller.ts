import { z } from 'zod';
import {
  CancelLeaveRequestUseCase,
  CreateLeaveQuotaUseCase,
  CreateLeaveTypeUseCase,
  GetLeaveQuotasByMemberUseCase,
  GetLeaveRequestsByCompanyUseCase,
  GetLeaveRequestsByMemberUseCase,
  GetLeaveTypesByCompanyUseCase,
  ReviewLeaveRequestUseCase,
  SubmitLeaveRequestUseCase,
  UpdateLeaveQuotaUseCase,
  UpdateLeaveTypeUseCase,
} from '@repo/applications';
import {
  createLeaveQuotaSchema,
  createLeaveRequestSchema,
  createLeaveTypeSchema,
  updateLeaveQuotaSchema,
  updateLeaveTypeSchema,
} from '@repo/domains/schema/leave';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const companyIdParamSchema = z.object({ companyId: z.string().uuid() });
const memberIdParamSchema = z.object({ memberId: z.string().uuid() });
const memberQuotaParamsSchema = z.object({
  memberId: z.string().uuid(),
  year: z.coerce.number().int(),
});

const reviewBodySchema = z.object({
  action: z.enum(['approved', 'rejected']),
  reviewNote: z.string().optional(),
});

const leaveTypesQuerySchema = z.object({
  onlyActive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

const companyRequestsQuerySchema = z.object({
  status: z.string().optional(),
});

export class LeaveController extends Controller {
  constructor(
    private readonly createLeaveTypeUseCase: CreateLeaveTypeUseCase,
    private readonly updateLeaveTypeUseCase: UpdateLeaveTypeUseCase,
    private readonly getLeaveTypesByCompanyUseCase: GetLeaveTypesByCompanyUseCase,
    private readonly createLeaveQuotaUseCase: CreateLeaveQuotaUseCase,
    private readonly updateLeaveQuotaUseCase: UpdateLeaveQuotaUseCase,
    private readonly getLeaveQuotasByMemberUseCase: GetLeaveQuotasByMemberUseCase,
    private readonly submitLeaveRequestUseCase: SubmitLeaveRequestUseCase,
    private readonly reviewLeaveRequestUseCase: ReviewLeaveRequestUseCase,
    private readonly cancelLeaveRequestUseCase: CancelLeaveRequestUseCase,
    private readonly getLeaveRequestsByMemberUseCase: GetLeaveRequestsByMemberUseCase,
    private readonly getLeaveRequestsByCompanyUseCase: GetLeaveRequestsByCompanyUseCase,
  ) {
    super();
  }

  // --- Leave Types ---

  public createType = this.validator(
    { body: createLeaveTypeSchema },
    async (c) => {
      const body = c.get('body');
      const leaveType = await this.createLeaveTypeUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Leave type created successfully', leaveType);
    },
  );

  public updateType = this.validator(
    { params: idParamSchema, body: updateLeaveTypeSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const leaveType = await this.updateLeaveTypeUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Leave type updated successfully', leaveType);
    },
  );

  public getTypesByCompany = this.validator(
    { params: companyIdParamSchema, query: leaveTypesQuerySchema },
    async (c) => {
      const { companyId } = c.get('params');
      const query = c.get('query');
      const types = await this.getLeaveTypesByCompanyUseCase.execute({
        ...this.securityContext(c),
        companyId,
        onlyActive: query?.onlyActive,
      });
      return this.success(c, 'Leave types retrieved successfully', types);
    },
  );

  // --- Leave Quotas ---

  public createQuota = this.validator(
    { body: createLeaveQuotaSchema },
    async (c) => {
      const body = c.get('body');
      const quota = await this.createLeaveQuotaUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Leave quota created successfully', quota);
    },
  );

  public updateQuota = this.validator(
    { params: idParamSchema, body: updateLeaveQuotaSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const quota = await this.updateLeaveQuotaUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Leave quota updated successfully', quota);
    },
  );

  public getQuotasByMember = this.validator(
    { params: memberQuotaParamsSchema },
    async (c) => {
      const { memberId, year } = c.get('params');
      const quotas = await this.getLeaveQuotasByMemberUseCase.execute({
        ...this.securityContext(c),
        companyMemberId: memberId,
        year,
      });
      return this.success(c, 'Leave quotas retrieved successfully', quotas);
    },
  );

  // --- Leave Requests ---

  public submitRequest = this.validator(
    { body: createLeaveRequestSchema },
    async (c) => {
      const body = c.get('body');
      const request = await this.submitLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Leave request submitted successfully', request);
    },
  );

  public reviewRequest = this.validator(
    { params: idParamSchema, body: reviewBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const request = await this.reviewLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
        action: body.action,
        reviewNote: body.reviewNote,
      });
      return this.success(c, 'Leave request reviewed successfully', request);
    },
  );

  public cancelRequest = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const request = await this.cancelLeaveRequestUseCase.execute({
        ...this.securityContext(c),
        id,
      });
      return this.success(c, 'Leave request cancelled successfully', request);
    },
  );

  public getMemberRequests = this.validator(
    { params: memberIdParamSchema },
    async (c) => {
      const { memberId } = c.get('params');
      const requests = await this.getLeaveRequestsByMemberUseCase.execute({
        ...this.securityContext(c),
        companyMemberId: memberId,
      });
      return this.success(c, 'Leave requests retrieved successfully', requests);
    },
  );

  public getCompanyRequests = this.validator(
    { params: companyIdParamSchema, query: companyRequestsQuerySchema },
    async (c) => {
      const { companyId } = c.get('params');
      const query = c.get('query');
      const requests = await this.getLeaveRequestsByCompanyUseCase.execute({
        ...this.securityContext(c),
        companyId,
        status: query?.status,
      });
      return this.success(
        c,
        'Company leave requests retrieved successfully',
        requests,
      );
    },
  );
}

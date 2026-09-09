import { z } from 'zod';
import {
  AssignFormRolesUseCase,
  CloneFormSubmissionUseCase,
  CreateFormFieldUseCase,
  CreateFormSectionUseCase,
  CreateFormTemplateUseCase,
  GetFormSubmissionUseCase,
  GetFormTemplateUseCase,
  ListFormSubmissionsUseCase,
  ListFormTemplatesByCompanyUseCase,
  PublishFormVersionUseCase,
  ReviewFormSubmissionUseCase,
  SaveFormSubmissionDraftUseCase,
  StartFormSubmissionUseCase,
  SubmitFormSubmissionUseCase,
  UpdateFormTemplateUseCase,
} from '@repo/applications';
import {
  createFormFieldSchema,
  createFormSectionSchema,
  createFormTemplateSchema,
  updateFormTemplateSchema,
} from '@repo/domains/schema/form';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const companyIdParamSchema = z.object({ companyId: z.string().uuid() });

const assignRolesBodySchema = z.object({
  roleIds: z.array(z.string().uuid()),
});

const publishBodySchema = z.object({
  memberId: z.string().uuid(),
});

const startSubmissionBodySchema = z.object({
  formTemplateId: z.string().uuid(),
  roleId: z.string().uuid(),
  memberId: z.string().uuid(),
});

const saveDraftBodySchema = z.object({
  memberId: z.string().uuid(),
  expectedRevision: z.number().int(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid(),
      value: z.unknown().optional(),
    }),
  ),
});

const submitBodySchema = z.object({
  memberId: z.string().uuid(),
  expectedRevision: z.number().int(),
});

const cloneBodySchema = z.object({
  memberId: z.string().uuid(),
});

const reviewBodySchema = z.object({
  memberId: z.string().uuid(),
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().optional().nullable(),
});

const listSubmissionsQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  formTemplateId: z.string().uuid().optional(),
});

export class FormController extends Controller {
  constructor(
    private readonly createFormTemplateUseCase: CreateFormTemplateUseCase,
    private readonly updateFormTemplateUseCase: UpdateFormTemplateUseCase,
    private readonly getFormTemplateUseCase: GetFormTemplateUseCase,
    private readonly listFormTemplatesByCompanyUseCase: ListFormTemplatesByCompanyUseCase,
    private readonly assignFormRolesUseCase: AssignFormRolesUseCase,
    private readonly createFormSectionUseCase: CreateFormSectionUseCase,
    private readonly createFormFieldUseCase: CreateFormFieldUseCase,
    private readonly publishFormVersionUseCase: PublishFormVersionUseCase,
    private readonly startFormSubmissionUseCase: StartFormSubmissionUseCase,
    private readonly saveFormSubmissionDraftUseCase: SaveFormSubmissionDraftUseCase,
    private readonly submitFormSubmissionUseCase: SubmitFormSubmissionUseCase,
    private readonly cloneFormSubmissionUseCase: CloneFormSubmissionUseCase,
    private readonly getFormSubmissionUseCase: GetFormSubmissionUseCase,
    private readonly listFormSubmissionsUseCase: ListFormSubmissionsUseCase,
    private readonly reviewFormSubmissionUseCase: ReviewFormSubmissionUseCase,
  ) {
    super();
  }

  // --- Form Templates & Builder ---

  public createTemplate = this.validator(
    { body: createFormTemplateSchema },
    async (c) => {
      const body = c.get('body');
      const template = await this.createFormTemplateUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Form template created successfully', template);
    },
  );

  public updateTemplate = this.validator(
    { params: idParamSchema, body: updateFormTemplateSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const template = await this.updateFormTemplateUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
      });
      return this.success(c, 'Form template updated successfully', template);
    },
  );

  public getTemplate = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const detail = await this.getFormTemplateUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Form template retrieved successfully', detail);
  });

  public listTemplatesByCompany = this.validator(
    { params: companyIdParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const templates = await this.listFormTemplatesByCompanyUseCase.execute({
        ...this.securityContext(c),
        companyId,
      });
      return this.success(
        c,
        'Form templates retrieved successfully',
        templates,
      );
    },
  );

  public assignRoles = this.validator(
    { params: idParamSchema, body: assignRolesBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const roles = await this.assignFormRolesUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        roleIds: body.roleIds,
      });
      return this.success(c, 'Form roles assigned successfully', roles);
    },
  );

  public createSection = this.validator(
    { body: createFormSectionSchema },
    async (c) => {
      const body = c.get('body');
      const section = await this.createFormSectionUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Form section created successfully', section);
    },
  );

  public createField = this.validator(
    { body: createFormFieldSchema },
    async (c) => {
      const body = c.get('body');
      const field = await this.createFormFieldUseCase.execute({
        ...this.securityContext(c),
        data: body,
      });
      return this.created(c, 'Form field created successfully', field);
    },
  );

  public publishVersion = this.validator(
    { params: idParamSchema, body: publishBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const version = await this.publishFormVersionUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        memberId: body.memberId,
      });
      return this.success(c, 'Form published successfully', version);
    },
  );

  // --- Form Submissions ---

  public startSubmission = this.validator(
    { body: startSubmissionBodySchema },
    async (c) => {
      const body = c.get('body');
      const submission = await this.startFormSubmissionUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: body.formTemplateId,
        roleId: body.roleId,
        memberId: body.memberId,
      });
      return this.created(
        c,
        'Form submission started successfully',
        submission,
      );
    },
  );

  public saveDraft = this.validator(
    { params: idParamSchema, body: saveDraftBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const submission = await this.saveFormSubmissionDraftUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        memberId: body.memberId,
        expectedRevision: body.expectedRevision,
        answers: body.answers,
      });
      return this.success(c, 'Draft answers saved successfully', submission);
    },
  );

  public submit = this.validator(
    { params: idParamSchema, body: submitBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const submission = await this.submitFormSubmissionUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        memberId: body.memberId,
        expectedRevision: body.expectedRevision,
      });
      return this.success(c, 'Form submitted successfully', submission);
    },
  );

  public clone = this.validator(
    { params: idParamSchema, body: cloneBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const clone = await this.cloneFormSubmissionUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        memberId: body.memberId,
      });
      return this.created(c, 'Form rework draft created successfully', clone);
    },
  );

  public getSubmission = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const detail = await this.getFormSubmissionUseCase.execute({
        ...this.securityContext(c),
        id,
      });
      return this.success(c, 'Form submission retrieved successfully', detail);
    },
  );

  public listSubmissions = this.validator(
    { query: listSubmissionsQuerySchema },
    async (c) => {
      const query = c.get('query');
      const submissions = await this.listFormSubmissionsUseCase.execute({
        ...this.securityContext(c),
        companyId: query?.companyId,
        roleId: query?.roleId,
        formTemplateId: query?.formTemplateId,
      });
      return this.success(
        c,
        'Form submissions retrieved successfully',
        submissions,
      );
    },
  );

  // --- Submission Review ---

  public review = this.validator(
    { params: idParamSchema, body: reviewBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const review = await this.reviewFormSubmissionUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        memberId: body.memberId,
        action: body.action,
        note: body.note,
      });
      return this.success(c, 'Form review recorded successfully', review);
    },
  );
}

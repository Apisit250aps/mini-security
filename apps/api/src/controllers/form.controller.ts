import { z } from 'zod';
import {
  FormAttachmentUseCase,
  ValidationError,
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  GetFormTemplateUseCase,
  ListFormTemplatesByOrganizationUseCase,
  CreateFormSectionUseCase,
  CreateFormFieldUseCase,
  EditFormFieldUseCase,
  DeleteFormFieldUseCase,
  DeleteFormSectionUseCase,
  PublishFormVersionUseCase,
  ReorderFormSectionUseCase,
  ReorderFormFieldUseCase,
  CreateFormPlanUseCase,
  UpdateFormPlanUseCase,
  GetFormPlanUseCase,
  ListFormPlansUseCase,
  ActivateFormPlanUseCase,
  PauseFormPlanUseCase,
  PreviewScheduleUseCase,
  OpenDueOccurrencesUseCase,
  CancelOccurrenceUseCase,
  ListOccurrencesUseCase,
  ListMyAssignmentsUseCase,
  ListOccurrenceAssignmentsUseCase,
  GetAssignmentUseCase,
  CancelAssignmentUseCase,
  ReplaceAssignmentUseCase,
  StartFormSubmissionUseCase,
  SaveFormSubmissionDraftUseCase,
  SubmitFormSubmissionUseCase,
  CreateCorrectionUseCase,
  GetFormSubmissionUseCase,
  ListFormSubmissionsUseCase,
  ListReviewQueueUseCase,
  GetReviewDetailUseCase,
  RecordAnswerReviewUseCase,
  RecordSectionReviewUseCase,
  FinalizeSubmissionReviewUseCase,
} from '@repo/applications';
import {
  formScheduleConfigSchema,
  type EditFormField,
} from '@repo/domains/schema/form';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const organizationIdParamSchema = z.object({
  organizationId: z.string().uuid(),
});
const fieldParamSchema = z.object({
  id: z.string().uuid(),
  fieldId: z.string().uuid(),
});
const answerParamSchema = z.object({
  id: z.string().uuid(),
  answerId: z.string().uuid(),
});
const sectionParamSchema = z.object({
  id: z.string().uuid(),
  sectionId: z.string().uuid(),
});
const optionalQueryUuid = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().uuid().optional(),
);
const organizationIdQuerySchema = z.object({
  organizationId: optionalQueryUuid,
});
const assignmentListSchema = z.object({
  organizationId: optionalQueryUuid,
  memberId: optionalQueryUuid,
});
const listSubmissionsQuerySchema = z.object({
  organizationId: optionalQueryUuid,
  assignmentId: optionalQueryUuid,
});

const createFormTemplateSchema = z.object({
  organizationId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().nullish(),
  isActive: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
});
const updateFormTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});
const createFormSectionSchema = z.object({
  organizationId: z.string().uuid().optional(),
  formTemplateId: z.string().uuid().optional(),
  formVersionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullish(),
  sortOrder: z.number().int().optional(),
});
const createFormFieldSchema = z
  .object({
    formTemplateId: z.string().uuid().optional(),
    formVersionId: z.string().uuid(),
    sectionId: z.string().uuid().optional(),
    formSectionId: z.string().uuid().optional(),
    organizationId: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    type: z.enum([
      'TEXT',
      'TEXTAREA',
      'NUMBER',
      'SELECT',
      'RADIO',
      'CHECKBOX_GROUP',
      'BOOLEAN',
      'DATE',
      'IMAGE',
      'FILE',
    ]),
    label: z.string().min(1).max(255),
    description: z.string().nullish(),
    placeholder: z.string().max(255).nullish(),
    isRequired: z.boolean().default(false),
    min: z.number().nullish(),
    max: z.number().nullish(),
    minLength: z.number().int().nonnegative().nullish(),
    maxLength: z.number().int().nonnegative().nullish(),
    sortOrder: z.number().int().optional(),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          sortOrder: z.number().int().optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => Boolean(data.formSectionId || data.sectionId), {
    message: 'formSectionId or sectionId is required',
    path: ['formSectionId'],
  });
const editFormFieldSchema = z
  .object({
    sectionId: z.string().uuid().optional(),
    formSectionId: z.string().uuid().optional(),
    name: z.string().min(1).max(100).optional(),
    type: z.enum([
      'TEXT',
      'TEXTAREA',
      'NUMBER',
      'SELECT',
      'RADIO',
      'CHECKBOX_GROUP',
      'BOOLEAN',
      'DATE',
      'EMAIL',
      'IMAGE',
      'FILE',
    ]),
    label: z.string().min(1).max(255),
    description: z.string().nullish(),
    placeholder: z.string().max(255).nullish(),
    isRequired: z.boolean().default(false),
    min: z.number().nullish(),
    max: z.number().nullish(),
    minLength: z.number().int().nonnegative().nullish(),
    maxLength: z.number().int().nonnegative().nullish(),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          sortOrder: z.number().int().optional(),
        }),
      )
      .optional(),
  })
  .refine((data) => Boolean(data.formSectionId || data.sectionId), {
    message: 'formSectionId or sectionId is required',
    path: ['formSectionId'],
  });
const publishBodySchema = z.object({
  memberId: z.string().uuid().nullish().or(z.literal('')),
});
const reorderFormItemsSchema = z.object({
  formVersionId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    }),
  ),
});

// --- Plans Schemas ---
const createPlanBodySchema = z.object({
  data: z.object({
    organizationId: z.string().uuid(),
    formTemplateId: z.string().uuid(),
    name: z.string().min(1).max(255),
    scheduleKind: z.enum(['RECURRING', 'EXPLICIT']),
    scheduleConfig: formScheduleConfigSchema.nullish(),
    timezone: z.string().min(1),
    fixedVersionId: z.string().uuid().nullish(),
    latePolicy: z.enum(['ALLOW', 'DENY']).default('DENY'),
    missedPolicy: z.enum(['SKIP', 'CATCH_UP']).default('SKIP'),
  }),
  targets: z
    .array(
      z.object({
        roleId: z.string().uuid().nullish(),
        organizationMemberId: z.string().uuid().nullish(),
        roleDistribution: z.enum(['SHARED', 'PER_MEMBER']).nullish(),
      }),
    )
    .min(1),
  periods: z
    .array(
      z.object({
        opensAt: z
          .union([z.string(), z.date()])
          .transform((v) =>
            v instanceof Date ? v.toISOString() : new Date(v).toISOString(),
          ),
        dueAt: z
          .union([z.string(), z.date()])
          .transform((v) =>
            v instanceof Date ? v.toISOString() : new Date(v).toISOString(),
          ),
      }),
    )
    .optional(),
});

const updatePlanBodySchema = z.object({
  expectedRevision: z.number().int(),
  data: z
    .object({
      name: z.string().min(1).max(255).optional(),
      scheduleKind: z.enum(['RECURRING', 'EXPLICIT']).optional(),
      scheduleConfig: formScheduleConfigSchema.nullish(),
      timezone: z.string().min(1).optional(),
      fixedVersionId: z.string().uuid().nullish(),
      latePolicy: z.enum(['ALLOW', 'DENY']).optional(),
      missedPolicy: z.enum(['SKIP', 'CATCH_UP']).optional(),
    })
    .default({}),
  targets: z
    .array(
      z.object({
        roleId: z.string().uuid().nullish(),
        organizationMemberId: z.string().uuid().nullish(),
        roleDistribution: z.enum(['SHARED', 'PER_MEMBER']).nullish(),
      }),
    )
    .optional(),
  periods: z
    .array(
      z.object({
        opensAt: z
          .union([z.string(), z.date()])
          .transform((v) =>
            v instanceof Date ? v.toISOString() : new Date(v).toISOString(),
          ),
        dueAt: z
          .union([z.string(), z.date()])
          .transform((v) =>
            v instanceof Date ? v.toISOString() : new Date(v).toISOString(),
          ),
      }),
    )
    .optional(),
});

const activatePlanBodySchema = z.object({ expectedRevision: z.number().int() });
const pausePlanBodySchema = z.object({ expectedRevision: z.number().int() });

// --- Occurrences Schemas ---
const cancelOccurrenceBodySchema = z.object({
  cancelReason: z.string().min(1),
  expectedRevision: z.number().int(),
});
const listOccurrencesQuerySchema = z.object({
  organizationId: optionalQueryUuid,
  formTemplateId: optionalQueryUuid,
  planId: optionalQueryUuid,
});
const openOccurrencesBodySchema = z.object({
  organizationId: z.string().uuid(),
});

// --- Assignments Schemas ---
const cancelAssignmentBodySchema = z.object({
  cancelReason: z.string().min(1),
  expectedRevision: z.number().int(),
});
const replaceAssignmentBodySchema = z.object({
  cancelReason: z.string().min(1),
  newOrganizationMemberId: z.string().uuid().optional(),
  newRoleId: z.string().uuid().optional(),
});

// --- Submissions Schemas ---
const startSubmissionBodySchema = z.object({
  assignmentId: z.string().uuid(),
});
const saveDraftBodySchema = z.object({
  expectedRevision: z.number().int(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid(),
      value: z.unknown().optional(),
    }),
  ),
});
const submitBodySchema = z.object({
  expectedRevision: z.number().int(),
});

// --- Reviews Schemas ---
const recordReviewBodySchema = z.object({
  expectedRevision: z.number().int().positive(),
  action: z.enum(['PASS', 'NEEDS_CHANGES']),
  note: z.string().optional(),
  supersedesEntryId: z.string().uuid().optional(),
});
const finalizeReviewBodySchema = z.object({
  expectedRevision: z.number().int().positive(),
  action: z.enum(['APPROVE', 'RETURN']),
  note: z.string().optional(),
});

export class FormController extends Controller {
  constructor(
    private readonly formAttachmentUseCase: FormAttachmentUseCase,
    private readonly createFormTemplateUseCase: CreateFormTemplateUseCase,
    private readonly updateFormTemplateUseCase: UpdateFormTemplateUseCase,
    private readonly getFormTemplateUseCase: GetFormTemplateUseCase,
    private readonly listFormTemplatesByOrganizationUseCase: ListFormTemplatesByOrganizationUseCase,
    private readonly createFormSectionUseCase: CreateFormSectionUseCase,
    private readonly createFormFieldUseCase: CreateFormFieldUseCase,
    private readonly editFormFieldUseCase: EditFormFieldUseCase,
    private readonly deleteFormFieldUseCase: DeleteFormFieldUseCase,
    private readonly deleteFormSectionUseCase: DeleteFormSectionUseCase,
    private readonly publishFormVersionUseCase: PublishFormVersionUseCase,
    private readonly reorderFormSectionUseCase: ReorderFormSectionUseCase,
    private readonly reorderFormFieldUseCase: ReorderFormFieldUseCase,

    private readonly createFormPlanUseCase: CreateFormPlanUseCase,
    private readonly updateFormPlanUseCase: UpdateFormPlanUseCase,
    private readonly getFormPlanUseCase: GetFormPlanUseCase,
    private readonly listFormPlansUseCase: ListFormPlansUseCase,
    private readonly activateFormPlanUseCase: ActivateFormPlanUseCase,
    private readonly pauseFormPlanUseCase: PauseFormPlanUseCase,
    private readonly previewScheduleUseCase: PreviewScheduleUseCase,

    private readonly openDueOccurrencesUseCase: OpenDueOccurrencesUseCase,
    private readonly cancelOccurrenceUseCase: CancelOccurrenceUseCase,
    private readonly listOccurrencesUseCase: ListOccurrencesUseCase,

    private readonly listMyAssignmentsUseCase: ListMyAssignmentsUseCase,
    private readonly listOccurrenceAssignmentsUseCase: ListOccurrenceAssignmentsUseCase,
    private readonly getAssignmentUseCase: GetAssignmentUseCase,
    private readonly cancelAssignmentUseCase: CancelAssignmentUseCase,
    private readonly replaceAssignmentUseCase: ReplaceAssignmentUseCase,

    private readonly startFormSubmissionUseCase: StartFormSubmissionUseCase,
    private readonly saveFormSubmissionDraftUseCase: SaveFormSubmissionDraftUseCase,
    private readonly submitFormSubmissionUseCase: SubmitFormSubmissionUseCase,
    private readonly createCorrectionUseCase: CreateCorrectionUseCase,
    private readonly getFormSubmissionUseCase: GetFormSubmissionUseCase,
    private readonly listFormSubmissionsUseCase: ListFormSubmissionsUseCase,

    private readonly listReviewQueueUseCase: ListReviewQueueUseCase,
    private readonly getReviewDetailUseCase: GetReviewDetailUseCase,
    private readonly recordAnswerReviewUseCase: RecordAnswerReviewUseCase,
    private readonly recordSectionReviewUseCase: RecordSectionReviewUseCase,
    private readonly finalizeSubmissionReviewUseCase: FinalizeSubmissionReviewUseCase,
  ) {
    super();
  }

  public uploadAttachment = this.validator(
    { params: z.object({ id: z.string().uuid(), fieldId: z.string().uuid() }) },
    async (c) => {
      const { id, fieldId } = c.get('params');
      const body = await c.req.parseBody();
      const file = body.file;
      const revision = await z.coerce
        .number()
        .int()
        .positive()
        .safeParseAsync(body.expectedRevision);
      if (!(file instanceof File) || !revision.success)
        throw new ValidationError('File and expectedRevision are required');
      if (file.size > 10 * 1024 * 1024)
        throw new ValidationError('File exceeds 10 MB');
      const attachment = await this.formAttachmentUseCase.upload({
        ...this.securityContext(c),
        submissionId: id,
        fieldId,
        expectedRevision: revision.data,
        originalName: file.name,
        bytes: new Uint8Array(await file.arrayBuffer()),
      });
      return this.created(c, 'Attachment uploaded', attachment);
    },
  );

  public downloadAttachment = this.validator(
    { params: z.object({ attachmentId: z.string().uuid() }) },
    async (c) => {
      const result = await this.formAttachmentUseCase.download({
        ...this.securityContext(c),
        attachmentId: c.get('params').attachmentId,
      });
      return new Response(new Uint8Array(result.bytes).buffer, {
        headers: {
          'Content-Type': result.attachment.mimeType,
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(result.attachment.originalName)}`,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    },
  );

  public deleteAttachment = this.validator(
    {
      params: z.object({ attachmentId: z.string().uuid() }),
      body: z.object({ expectedRevision: z.number().int().positive() }),
    },
    async (c) => {
      await this.formAttachmentUseCase.remove({
        ...this.securityContext(c),
        ...c.get('params'),
        ...c.get('body'),
      });
      return this.success(c, 'Attachment removed');
    },
  );

  /**
   * Template & Builder
   */

  public createTemplate = this.validator(
    { body: createFormTemplateSchema },
    async (c) => {
      const body = c.get('body');
      const sec = this.securityContext(c);
      const organizationId = sec.activeOrganizationId ?? body.organizationId;
      if (!organizationId) {
        throw new ValidationError('Organization ID is required');
      }
      const template = await this.createFormTemplateUseCase.execute({
        ...sec,
        organizationId,
        data: {
          name: body.name,
          description: body.description ?? null,
          organizationId,
          isActive: body.isActive ?? true,
          createdBy: sec.memberId ?? body.createdBy ?? '',
        },
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

  public listTemplatesByOrganization = this.validator(
    { params: organizationIdParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const templates =
        await this.listFormTemplatesByOrganizationUseCase.execute({
          ...this.securityContext(c),
          organizationId,
        });
      return this.success(
        c,
        'Form templates retrieved successfully',
        templates,
      );
    },
  );

  public createSection = this.validator(
    { params: idParamSchema.optional(), body: createFormSectionSchema },
    async (c) => {
      const body = c.get('body');
      const section = await this.createFormSectionUseCase.execute({
        ...this.securityContext(c),
        data: {
          organizationId: (body.organizationId ??
            this.securityContext(c).activeOrganizationId)!,
          formVersionId: body.formVersionId,
          title: body.title,
          description: body.description ?? null,
          sortOrder: body.sortOrder ?? 0,
        },
      });
      return this.created(c, 'Form section created successfully', section);
    },
  );

  public createField = this.validator(
    { params: idParamSchema.optional(), body: createFormFieldSchema },
    async (c) => {
      const body = c.get('body');
      const formSectionId = (body.formSectionId ?? body.sectionId)!;
      const field = await this.createFormFieldUseCase.execute({
        ...this.securityContext(c),
        data: {
          organizationId: (body.organizationId ??
            this.securityContext(c).activeOrganizationId)!,
          formVersionId: body.formVersionId,
          formSectionId,
          name: body.name,
          type: body.type,
          label: body.label,
          description: body.description ?? null,
          placeholder: body.placeholder ?? null,
          isRequired: body.isRequired ?? false,
          min: body.min ?? null,
          max: body.max ?? null,
          minLength: body.minLength ?? null,
          maxLength: body.maxLength ?? null,
          sortOrder: body.sortOrder ?? 0,
          options: body.options,
        },
      });
      return this.created(c, 'Form field created successfully', field);
    },
  );

  public editField = this.validator(
    { params: fieldParamSchema, body: editFormFieldSchema },
    async (c) => {
      const { id, fieldId } = c.get('params');
      const body = c.get('body');
      const formSectionId = (body.formSectionId ?? body.sectionId)!;
      const field = await this.editFormFieldUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        fieldId,
        data: {
          formSectionId,
          ...(body.name !== undefined ? { name: body.name } : {}),
          type: body.type,
          label: body.label,
          description: body.description ?? null,
          placeholder: body.placeholder ?? null,
          isRequired: body.isRequired ?? false,
          min: body.min ?? null,
          max: body.max ?? null,
          minLength: body.minLength ?? null,
          maxLength: body.maxLength ?? null,
          options: body.options,
        } as EditFormField,
      });
      return this.success(c, 'Form field updated successfully', field);
    },
  );

  public deleteField = this.validator(
    { params: fieldParamSchema },
    async (c) => {
      const { id, fieldId } = c.get('params');
      await this.deleteFormFieldUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        fieldId,
      });
      return this.success(c, 'Form field deleted successfully', null);
    },
  );

  public deleteSection = this.validator(
    { params: sectionParamSchema },
    async (c) => {
      const { id, sectionId } = c.get('params');
      await this.deleteFormSectionUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        sectionId,
      });
      return this.success(c, 'Form section deleted successfully', null);
    },
  );

  public publishVersion = this.validator(
    { params: idParamSchema, body: publishBodySchema.optional() },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body') as { memberId?: string } | undefined;
      const sec = this.securityContext(c);
      const memberId =
        body?.memberId && body.memberId !== ''
          ? body.memberId
          : (sec.memberId ?? '');
      const version = await this.publishFormVersionUseCase.execute({
        ...sec,
        formTemplateId: id,
        memberId,
      });
      return this.success(c, 'Form published successfully', version);
    },
  );

  public reorderSections = this.validator(
    { params: idParamSchema, body: reorderFormItemsSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      await this.reorderFormSectionUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        formVersionId: body.formVersionId,
        items: body.items,
      });
      return this.success(c, 'Sections reordered successfully', null);
    },
  );

  public reorderFields = this.validator(
    { params: idParamSchema, body: reorderFormItemsSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      await this.reorderFormFieldUseCase.execute({
        ...this.securityContext(c),
        formTemplateId: id,
        formVersionId: body.formVersionId,
        items: body.items,
      });
      return this.success(c, 'Fields reordered successfully', null);
    },
  );

  /**
   * Plans
   */

  public createPlan = this.validator(
    { body: createPlanBodySchema },
    async (c) => {
      const body = c.get('body');
      const sec = this.securityContext(c);
      const plan = await this.createFormPlanUseCase.execute({
        ...sec,
        data: {
          ...body.data,
          fixedVersionId: body.data.fixedVersionId ?? null,
          scheduleConfig: body.data.scheduleConfig ?? null,
          revision: 1,
          createdBy: sec.memberId ?? sec.userId!,
        },
        targets: body.targets.map((t) => ({
          roleId: t.roleId ?? null,
          organizationMemberId: t.organizationMemberId ?? null,
          roleDistribution: t.roleDistribution ?? null,
        })),
        periods: body.periods,
      });
      return this.created(c, 'Form plan created successfully', plan);
    },
  );

  public listPlans = this.validator(
    { query: organizationIdQuerySchema },
    async (c) => {
      const { organizationId } = c.get('query');
      const ctx = this.securityContext(c);
      const activeOrganizationId =
        organizationId ?? ctx.activeOrganizationId ?? ctx.organizationId;
      if (!activeOrganizationId)
        throw new ValidationError('organizationId is required');
      const plans = await this.listFormPlansUseCase.execute({
        ...ctx,
        organizationId: activeOrganizationId,
      });
      return this.success(c, 'Form plans retrieved successfully', plans);
    },
  );

  public getPlan = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const plan = await this.getFormPlanUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Form plan retrieved successfully', plan);
  });

  public updatePlan = this.validator(
    { params: idParamSchema, body: updatePlanBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { expectedRevision, data, targets, periods } = c.get('body');
      const sec = this.securityContext(c);
      const organizationId = sec.activeOrganizationId;
      if (!organizationId) {
        throw new ValidationError('Organization ID is required');
      }
      const plan = await this.updateFormPlanUseCase.execute({
        ...sec,
        id,
        expectedRevision,
        organizationId,
        data: {
          ...data,
          organizationId,
        },
        targets: targets?.map((t) => ({
          ...t,
          roleDistribution: t.roleDistribution ?? null,
        })),
        periods,
      });
      return this.success(c, 'Form plan updated successfully', plan);
    },
  );

  public activatePlan = this.validator(
    { params: idParamSchema, body: activatePlanBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { expectedRevision } = c.get('body');
      const plan = await this.activateFormPlanUseCase.execute({
        ...this.securityContext(c),
        id,
        expectedRevision,
      });
      return this.success(c, 'Form plan activated successfully', plan);
    },
  );

  public pausePlan = this.validator(
    { params: idParamSchema, body: pausePlanBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { expectedRevision } = c.get('body');
      const plan = await this.pauseFormPlanUseCase.execute({
        ...this.securityContext(c),
        id,
        expectedRevision,
      });
      return this.success(c, 'Form plan paused successfully', plan);
    },
  );

  public previewSchedule = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const schedule = await this.previewScheduleUseCase.execute({
        ...this.securityContext(c),
        planId: id,
      });
      return this.success(
        c,
        'Schedule preview retrieved successfully',
        schedule,
      );
    },
  );

  /**
   * Occurrences
   */

  public listOccurrences = this.validator(
    { query: listOccurrencesQuerySchema },
    async (c) => {
      const query = c.get('query');
      const ctx = this.securityContext(c);
      const organizationId =
        query.organizationId ?? ctx.activeOrganizationId ?? ctx.organizationId;
      if (!organizationId)
        throw new ValidationError('organizationId is required');
      const occurrences = await this.listOccurrencesUseCase.execute({
        ...ctx,
        organizationId,
        formTemplateId: query.formTemplateId,
        planId: query.planId,
      });
      return this.success(
        c,
        'Form occurrences retrieved successfully',
        occurrences,
      );
    },
  );

  public openOccurrences = this.validator(
    { body: openOccurrencesBodySchema },
    async (c) => {
      const { organizationId } = c.get('body');
      const occurrences = await this.openDueOccurrencesUseCase.execute({
        ...this.securityContext(c),
        organizationId,
      });
      return this.success(
        c,
        'Due occurrences opened successfully',
        occurrences,
      );
    },
  );

  public cancelOccurrence = this.validator(
    { params: idParamSchema, body: cancelOccurrenceBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { cancelReason, expectedRevision } = c.get('body');
      const occurrence = await this.cancelOccurrenceUseCase.execute({
        ...this.securityContext(c),
        occurrenceId: id,
        cancelReason,
        expectedRevision,
        memberId: this.securityContext(c).memberId,
      });
      return this.success(c, 'Occurrence cancelled successfully', occurrence);
    },
  );

  /**
   * Assignments
   */

  public listMyAssignments = this.validator(
    { query: assignmentListSchema },
    async (c) => {
      const query = c.get('query');
      const ctx = this.securityContext(c);
      const organizationId = query.organizationId ?? ctx.activeOrganizationId;
      const memberId = query.memberId ?? ctx.memberId;
      if (!organizationId)
        throw new ValidationError('organizationId is required');
      if (!memberId) throw new ValidationError('memberId is required');
      const assignments = await this.listMyAssignmentsUseCase.execute({
        ...ctx,
        organizationId,
        memberId,
      });
      return this.success(c, 'Assignments retrieved successfully', assignments);
    },
  );

  public listOccurrenceAssignments = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const ctx = this.securityContext(c);
      const assignments = await this.listOccurrenceAssignmentsUseCase.execute({
        ...ctx,
        occurrenceId: id,
        organizationId: ctx.activeOrganizationId ?? undefined,
        memberId: ctx.memberId,
      });
      return this.success(
        c,
        'Occurrence assignments retrieved successfully',
        assignments,
      );
    },
  );

  public getAssignment = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const assignment = await this.getAssignmentUseCase.execute({
        ...this.securityContext(c),
        assignmentId: id,
      });
      return this.success(c, 'Assignment retrieved successfully', assignment);
    },
  );

  public cancelAssignment = this.validator(
    { params: idParamSchema, body: cancelAssignmentBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const { cancelReason, expectedRevision } = c.get('body');
      const assignment = await this.cancelAssignmentUseCase.execute({
        ...this.securityContext(c),
        assignmentId: id,
        cancelReason,
        expectedRevision,
        memberId: this.securityContext(c).memberId,
      });
      return this.success(c, 'Assignment cancelled successfully', assignment);
    },
  );

  public replaceAssignment = this.validator(
    { params: idParamSchema, body: replaceAssignmentBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const assignment = await this.replaceAssignmentUseCase.execute({
        ...this.securityContext(c),
        assignmentId: id,
        cancelReason: body.cancelReason,
        newOrganizationMemberId: body.newOrganizationMemberId,
        newRoleId: body.newRoleId,
      });
      return this.success(c, 'Assignment replaced successfully', assignment);
    },
  );

  /**
   * Submissions
   */

  public startSubmission = this.validator(
    { body: startSubmissionBodySchema },
    async (c) => {
      const body = c.get('body');
      const ctx = this.securityContext(c);
      const submission = await this.startFormSubmissionUseCase.execute({
        ...ctx,
        assignmentId: body.assignmentId,
        memberId: ctx.memberId,
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
      const ctx = this.securityContext(c);
      const submission = await this.saveFormSubmissionDraftUseCase.execute({
        ...ctx,
        submissionId: id,
        memberId: ctx.memberId,
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
      const ctx = this.securityContext(c);
      const submission = await this.submitFormSubmissionUseCase.execute({
        ...ctx,
        submissionId: id,
        memberId: ctx.memberId,
        expectedRevision: body.expectedRevision,
      });
      return this.success(c, 'Form submitted successfully', submission);
    },
  );

  public createCorrection = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const ctx = this.securityContext(c);
      const correction = await this.createCorrectionUseCase.execute({
        ...ctx,
        submissionId: id,
        memberId: ctx.memberId,
      });
      return this.created(
        c,
        'Form correction draft created successfully',
        correction,
      );
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
      const ctx = this.securityContext(c);
      const organizationId =
        query.organizationId ?? ctx.activeOrganizationId ?? ctx.organizationId;
      const submissions = await this.listFormSubmissionsUseCase.execute({
        ...ctx,
        ...query,
        ...(organizationId ? { organizationId } : {}),
      });
      return this.success(
        c,
        'Form submissions retrieved successfully',
        submissions,
      );
    },
  );

  /**
   * Submission Reviews
   */

  public listReviewQueue = this.validator(
    { query: organizationIdQuerySchema },
    async (c) => {
      const { organizationId } = c.get('query');
      const ctx = this.securityContext(c);
      const activeOrganizationId =
        organizationId ?? ctx.activeOrganizationId ?? ctx.organizationId;
      if (!activeOrganizationId)
        throw new ValidationError('organizationId is required');
      const submissions = await this.listReviewQueueUseCase.execute({
        ...ctx,
        organizationId: activeOrganizationId,
      });
      return this.success(
        c,
        'Review queue retrieved successfully',
        submissions,
      );
    },
  );

  public getReviewDetail = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const entries = await this.getReviewDetailUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
      });
      return this.success(c, 'Review entries retrieved successfully', entries);
    },
  );

  public recordAnswerReview = this.validator(
    { params: answerParamSchema, body: recordReviewBodySchema },
    async (c) => {
      const { id, answerId } = c.get('params');
      const body = c.get('body');
      const entry = await this.recordAnswerReviewUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        answerId,
        ...body,
      });
      return this.created(c, 'Answer review recorded successfully', entry);
    },
  );

  public recordSectionReview = this.validator(
    { params: sectionParamSchema, body: recordReviewBodySchema },
    async (c) => {
      const { id, sectionId } = c.get('params');
      const body = c.get('body');
      const entry = await this.recordSectionReviewUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        sectionId,
        ...body,
      });
      return this.created(c, 'Section review recorded successfully', entry);
    },
  );

  public finalizeReview = this.validator(
    { params: idParamSchema, body: finalizeReviewBodySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const result = await this.finalizeSubmissionReviewUseCase.execute({
        ...this.securityContext(c),
        submissionId: id,
        ...body,
      });
      return this.success(c, 'Review finalized successfully', result);
    },
  );
}

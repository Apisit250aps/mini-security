import { z } from 'zod';
import {
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  GetFormTemplateUseCase,
  ListFormTemplatesByCompanyUseCase,
  CreateFormSectionUseCase,
  CreateFormFieldUseCase,
  EditFormFieldUseCase,
  DeleteFormFieldUseCase,
  PublishFormVersionUseCase,
  ReorderFormSectionUseCase,
  ReorderFormFieldUseCase,
  CreateFormPlanUseCase,
  GetFormPlanUseCase,
  ListFormPlansUseCase,
  ActivateFormPlanUseCase,
  PauseFormPlanUseCase,
  PreviewScheduleUseCase,
  OpenDueOccurrencesUseCase,
  CancelOccurrenceUseCase,
  ListMyAssignmentsUseCase,
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
import type { EditFormField } from '@repo/domains/schema/form';
import Controller from './base.controller';

const idParamSchema = z.object({ id: z.string().uuid() });
const companyIdParamSchema = z.object({ companyId: z.string().uuid() });
const fieldParamSchema = z.object({ id: z.string().uuid(), fieldId: z.string().uuid() });
const answerParamSchema = z.object({ id: z.string().uuid(), answerId: z.string().uuid() });
const sectionParamSchema = z.object({ id: z.string().uuid(), sectionId: z.string().uuid() });
const assignmentListSchema = z.object({ companyId: z.string().uuid(), memberId: z.string().uuid() });
const listSubmissionsQuerySchema = z.object({ companyId: z.string().uuid().optional(), assignmentId: z.string().uuid().optional() });

// --- Templates & Builder Schemas ---
const createFormTemplateSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});
const updateFormTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isArchived: z.boolean().optional(),
});
const createFormSectionSchema = z.object({
  companyId: z.string().uuid().optional(),
  formTemplateId: z.string().uuid(),
  formVersionId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});
const createFormFieldSchema = z.object({
  formTemplateId: z.string().uuid(),
  formVersionId: z.string().uuid(),
  sectionId: z.string().uuid(),
  companyId: z.string().uuid().optional(),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE']),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().int().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
});
const editFormFieldSchema = z.object({
  sectionId: z.string().uuid(),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE']),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  isRequired: z.boolean().default(false),
  options: z.record(z.string(), z.unknown()).optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
});
const publishBodySchema = z.object({
  memberId: z.string().uuid(),
});
const reorderFormItemsSchema = z.object({
  formVersionId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    })
  ),
});

// --- Plans Schemas ---
const createPlanBodySchema = z.object({
  data: z.object({
    companyId: z.string().uuid(),
    formTemplateId: z.string().uuid(),
    name: z.string().min(1).max(255),
    scheduleKind: z.enum(['RECURRING', 'EXPLICIT']),
    scheduleConfig: z.record(z.string(), z.unknown()).optional(),
    timezone: z.string().min(1),
    fixedVersionId: z.string().uuid().optional(),
    reviewMode: z.enum(['NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS']).default('OVERALL'),
    latePolicy: z.enum(['ALLOW', 'DENY']).default('DENY'),
    missedPolicy: z.enum(['SKIP', 'CATCH_UP']).default('SKIP'),
  }),
  targets: z.array(z.object({
    roleId: z.string().uuid().optional(),
    companyMemberId: z.string().uuid().optional(),
    roleDistribution: z.enum(['SHARED', 'PER_MEMBER']).optional(),
  })).min(1),
  periods: z.array(z.object({
    opensAt: z.string().datetime(),
    dueAt: z.string().datetime(),
  })).optional(),
});

const activatePlanBodySchema = z.object({ expectedRevision: z.number().int() });
const pausePlanBodySchema = z.object({ expectedRevision: z.number().int() });

// --- Occurrences Schemas ---
const cancelOccurrenceBodySchema = z.object({
  cancelReason: z.string().min(1),
  expectedRevision: z.number().int(),
});
const openOccurrencesBodySchema = z.object({
  companyId: z.string().uuid(),
});

// --- Assignments Schemas ---
const cancelAssignmentBodySchema = z.object({
  cancelReason: z.string().min(1),
  expectedRevision: z.number().int(),
});
const replaceAssignmentBodySchema = z.object({
  cancelReason: z.string().min(1),
  newCompanyMemberId: z.string().uuid().optional(),
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
  action: z.enum(['PASS', 'NEEDS_CHANGES']),
  note: z.string().optional(),
  supersedesEntryId: z.string().uuid().optional(),
});
const finalizeReviewBodySchema = z.object({
  action: z.enum(['APPROVE', 'RETURN']),
  note: z.string().optional(),
});

export class FormController extends Controller {
  constructor(
    private readonly createFormTemplateUseCase: CreateFormTemplateUseCase,
    private readonly updateFormTemplateUseCase: UpdateFormTemplateUseCase,
    private readonly getFormTemplateUseCase: GetFormTemplateUseCase,
    private readonly listFormTemplatesByCompanyUseCase: ListFormTemplatesByCompanyUseCase,
    private readonly createFormSectionUseCase: CreateFormSectionUseCase,
    private readonly createFormFieldUseCase: CreateFormFieldUseCase,
    private readonly editFormFieldUseCase: EditFormFieldUseCase,
    private readonly deleteFormFieldUseCase: DeleteFormFieldUseCase,
    private readonly publishFormVersionUseCase: PublishFormVersionUseCase,
    private readonly reorderFormSectionUseCase: ReorderFormSectionUseCase,
    private readonly reorderFormFieldUseCase: ReorderFormFieldUseCase,

    private readonly createFormPlanUseCase: CreateFormPlanUseCase,
    private readonly getFormPlanUseCase: GetFormPlanUseCase,
    private readonly listFormPlansUseCase: ListFormPlansUseCase,
    private readonly activateFormPlanUseCase: ActivateFormPlanUseCase,
    private readonly pauseFormPlanUseCase: PauseFormPlanUseCase,
    private readonly previewScheduleUseCase: PreviewScheduleUseCase,

    private readonly openDueOccurrencesUseCase: OpenDueOccurrencesUseCase,
    private readonly cancelOccurrenceUseCase: CancelOccurrenceUseCase,

    private readonly listMyAssignmentsUseCase: ListMyAssignmentsUseCase,
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
    private readonly finalizeSubmissionReviewUseCase: FinalizeSubmissionReviewUseCase
  ) {
    super();
  }

  // ==========================================
  // Template & Builder
  // ==========================================

  public createTemplate = this.validator({ body: createFormTemplateSchema }, async (c) => {
    const body = c.get('body');
    const template = await this.createFormTemplateUseCase.execute({
      ...this.securityContext(c),
      data: {
        ...body,
        isActive: true,
        createdBy: this.securityContext(c).userId!,
      },
    });
    return this.created(c, 'Form template created successfully', template);
  });

  public updateTemplate = this.validator({ params: idParamSchema, body: updateFormTemplateSchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    const template = await this.updateFormTemplateUseCase.execute({
      ...this.securityContext(c),
      id,
      data: body,
    });
    return this.success(c, 'Form template updated successfully', template);
  });

  public getTemplate = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const detail = await this.getFormTemplateUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Form template retrieved successfully', detail);
  });

  public listTemplatesByCompany = this.validator({ params: companyIdParamSchema }, async (c) => {
    const { companyId } = c.get('params');
    const templates = await this.listFormTemplatesByCompanyUseCase.execute({
      ...this.securityContext(c),
      companyId,
    });
    return this.success(c, 'Form templates retrieved successfully', templates);
  });

  public createSection = this.validator({ body: createFormSectionSchema }, async (c) => {
    const body = c.get('body');
    const section = await this.createFormSectionUseCase.execute({
      ...this.securityContext(c),
      data: {
        ...body,
        sortOrder: body.sortOrder ?? 0,
        companyId: (body.companyId ?? this.securityContext(c).activeCompanyId)!,
      },
    });
    return this.created(c, 'Form section created successfully', section);
  });

  public createField = this.validator({ body: createFormFieldSchema }, async (c) => {
    const body = c.get('body');
    const field = await this.createFormFieldUseCase.execute({
      ...this.securityContext(c),
      data: {
        ...body,
        formSectionId: body.sectionId,
        sortOrder: body.sortOrder ?? 0,
        companyId: (body.companyId ?? this.securityContext(c).activeCompanyId)!,
        config: body.options ?? {},
      },
    });
    return this.created(c, 'Form field created successfully', field);
  });

  public editField = this.validator({ params: fieldParamSchema, body: editFormFieldSchema }, async (c) => {
    const { id, fieldId } = c.get('params');
    const body = c.get('body');
    const field = await this.editFormFieldUseCase.execute({
      ...this.securityContext(c),
      formTemplateId: id,
      fieldId,
      data: {
        ...body,
        formSectionId: body.sectionId!,
        config: body.options ?? {},
      } as EditFormField,
    });
    return this.success(c, 'Form field updated successfully', field);
  });

  public deleteField = this.validator({ params: fieldParamSchema }, async (c) => {
    const { id, fieldId } = c.get('params');
    await this.deleteFormFieldUseCase.execute({
      ...this.securityContext(c),
      formTemplateId: id,
      fieldId,
    });
    return this.success(c, 'Form field deleted successfully', null);
  });

  public publishVersion = this.validator({ params: idParamSchema, body: publishBodySchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    const version = await this.publishFormVersionUseCase.execute({
      ...this.securityContext(c),
      formTemplateId: id,
      memberId: body.memberId,
    });
    return this.success(c, 'Form published successfully', version);
  });

  public reorderSections = this.validator({ params: idParamSchema, body: reorderFormItemsSchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    await this.reorderFormSectionUseCase.execute({
      ...this.securityContext(c),
      formTemplateId: id,
      formVersionId: body.formVersionId,
      items: body.items,
    });
    return this.success(c, 'Sections reordered successfully', null);
  });

  public reorderFields = this.validator({ params: idParamSchema, body: reorderFormItemsSchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    await this.reorderFormFieldUseCase.execute({
      ...this.securityContext(c),
      formTemplateId: id,
      formVersionId: body.formVersionId,
      items: body.items,
    });
    return this.success(c, 'Fields reordered successfully', null);
  });

  // ==========================================
  // Plans
  // ==========================================

  public createPlan = this.validator({ body: createPlanBodySchema }, async (c) => {
    const body = c.get('body');
    const plan = await this.createFormPlanUseCase.execute({
      ...this.securityContext(c),
      data: {
        ...body.data,
        scheduleConfig: body.data.scheduleConfig ?? null,
        revision: 1,
        createdBy: this.securityContext(c).userId!,
      },
      targets: body.targets,
      periods: body.periods,
    });
    return this.created(c, 'Form plan created successfully', plan);
  });

  public listPlans = this.validator({ query: companyIdParamSchema }, async (c) => {
    const { companyId } = c.get('query');
    const plans = await this.listFormPlansUseCase.execute({
      ...this.securityContext(c),
      companyId,
    });
    return this.success(c, 'Form plans retrieved successfully', plans);
  });

  public getPlan = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const plan = await this.getFormPlanUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Form plan retrieved successfully', plan);
  });

  public activatePlan = this.validator({ params: idParamSchema, body: activatePlanBodySchema }, async (c) => {
    const { id } = c.get('params');
    const { expectedRevision } = c.get('body');
    const plan = await this.activateFormPlanUseCase.execute({
      ...this.securityContext(c),
      id,
      expectedRevision,
    });
    return this.success(c, 'Form plan activated successfully', plan);
  });

  public pausePlan = this.validator({ params: idParamSchema, body: pausePlanBodySchema }, async (c) => {
    const { id } = c.get('params');
    const { expectedRevision } = c.get('body');
    const plan = await this.pauseFormPlanUseCase.execute({
      ...this.securityContext(c),
      id,
      expectedRevision,
    });
    return this.success(c, 'Form plan paused successfully', plan);
  });

  public previewSchedule = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const schedule = await this.previewScheduleUseCase.execute({
      ...this.securityContext(c),
      planId: id,
    });
    return this.success(c, 'Schedule preview retrieved successfully', schedule);
  });

  // ==========================================
  // Occurrences
  // ==========================================

  public openOccurrences = this.validator({ body: openOccurrencesBodySchema }, async (c) => {
    const { companyId } = c.get('body');
    const occurrences = await this.openDueOccurrencesUseCase.execute({
      ...this.securityContext(c),
      companyId,
    });
    return this.success(c, 'Due occurrences opened successfully', occurrences);
  });

  public cancelOccurrence = this.validator({ params: idParamSchema, body: cancelOccurrenceBodySchema }, async (c) => {
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
  });

  // ==========================================
  // Assignments
  // ==========================================

  public listMyAssignments = this.validator({ query: assignmentListSchema }, async (c) => {
    const { companyId, memberId } = c.get('query');
    const assignments = await this.listMyAssignmentsUseCase.execute({
      ...this.securityContext(c),
      companyId,
      memberId,
    });
    return this.success(c, 'Assignments retrieved successfully', assignments);
  });

  public getAssignment = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const assignment = await this.getAssignmentUseCase.execute({
      ...this.securityContext(c),
      assignmentId: id,
    });
    return this.success(c, 'Assignment retrieved successfully', assignment);
  });

  public cancelAssignment = this.validator({ params: idParamSchema, body: cancelAssignmentBodySchema }, async (c) => {
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
  });

  public replaceAssignment = this.validator({ params: idParamSchema, body: replaceAssignmentBodySchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    const assignment = await this.replaceAssignmentUseCase.execute({
      ...this.securityContext(c),
      assignmentId: id,
      ...body,
      memberId: this.securityContext(c).memberId,
    });
    return this.success(c, 'Assignment replaced successfully', assignment);
  });

  // ==========================================
  // Submissions
  // ==========================================

  public startSubmission = this.validator({ body: startSubmissionBodySchema }, async (c) => {
    const body = c.get('body');
    const ctx = this.securityContext(c);
    const submission = await this.startFormSubmissionUseCase.execute({
      ...ctx,
      assignmentId: body.assignmentId,
      memberId: ctx.memberId,
    });
    return this.created(c, 'Form submission started successfully', submission);
  });

  public saveDraft = this.validator({ params: idParamSchema, body: saveDraftBodySchema }, async (c) => {
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
  });

  public submit = this.validator({ params: idParamSchema, body: submitBodySchema }, async (c) => {
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
  });

  public createCorrection = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const ctx = this.securityContext(c);
    const correction = await this.createCorrectionUseCase.execute({
      ...ctx,
      submissionId: id,
      memberId: ctx.memberId,
    });
    return this.created(c, 'Form correction draft created successfully', correction);
  });

  public getSubmission = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const detail = await this.getFormSubmissionUseCase.execute({
      ...this.securityContext(c),
      id,
    });
    return this.success(c, 'Form submission retrieved successfully', detail);
  });

  public listSubmissions = this.validator({ query: listSubmissionsQuerySchema }, async (c) => {
    const query = c.get('query');
    const submissions = await this.listFormSubmissionsUseCase.execute({
      ...this.securityContext(c),
      ...query,
    });
    return this.success(c, 'Form submissions retrieved successfully', submissions);
  });

  // ==========================================
  // Submission Reviews
  // ==========================================

  public listReviewQueue = this.validator({ query: companyIdParamSchema }, async (c) => {
    const { companyId } = c.get('query');
    const submissions = await this.listReviewQueueUseCase.execute({
      ...this.securityContext(c),
      companyId,
    });
    return this.success(c, 'Review queue retrieved successfully', submissions);
  });

  public getReviewDetail = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const entries = await this.getReviewDetailUseCase.execute({
      ...this.securityContext(c),
      submissionId: id,
    });
    return this.success(c, 'Review entries retrieved successfully', entries);
  });

  public recordAnswerReview = this.validator({ params: answerParamSchema, body: recordReviewBodySchema }, async (c) => {
    const { id, answerId } = c.get('params');
    const body = c.get('body');
    const entry = await this.recordAnswerReviewUseCase.execute({
      ...this.securityContext(c),
      submissionId: id,
      answerId,
      ...body,
    });
    return this.created(c, 'Answer review recorded successfully', entry);
  });

  public recordSectionReview = this.validator({ params: sectionParamSchema, body: recordReviewBodySchema }, async (c) => {
    const { id, sectionId } = c.get('params');
    const body = c.get('body');
    const entry = await this.recordSectionReviewUseCase.execute({
      ...this.securityContext(c),
      submissionId: id,
      sectionId,
      ...body,
    });
    return this.created(c, 'Section review recorded successfully', entry);
  });

  public finalizeReview = this.validator({ params: idParamSchema, body: finalizeReviewBodySchema }, async (c) => {
    const { id } = c.get('params');
    const body = c.get('body');
    const result = await this.finalizeSubmissionReviewUseCase.execute({
      ...this.securityContext(c),
      submissionId: id,
      ...body,
    });
    return this.success(c, 'Review finalized successfully', result);
  });
}

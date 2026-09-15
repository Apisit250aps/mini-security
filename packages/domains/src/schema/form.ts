import { z } from 'zod';
import {
  AppendOnlyBaseEntity,
  BaseEntity,
  BooleanField,
  DateField,
  EnumField,
  NumberField,
  StringField,
  UUIDField,
} from '#lib/entity';

// ==========================================
// Enums
// ==========================================

export const FormVersionStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type FormVersionStatus = (typeof FormVersionStatusValues)[number];

export const FormFieldTypeValues = ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE'] as const;
export type FormFieldType = (typeof FormFieldTypeValues)[number];

export const FormScheduleKindValues = ['RECURRING', 'EXPLICIT'] as const;
export type FormScheduleKind = (typeof FormScheduleKindValues)[number];

export const FormReviewModeValues = ['NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS'] as const;
export type FormReviewMode = (typeof FormReviewModeValues)[number];

export const FormRoleDistributionValues = ['SHARED', 'PER_MEMBER'] as const;
export type FormRoleDistribution = (typeof FormRoleDistributionValues)[number];

export const FormLatePolicyValues = ['ALLOW', 'DENY'] as const;
export type FormLatePolicy = (typeof FormLatePolicyValues)[number];

export const FormMissedPolicyValues = ['SKIP', 'CATCH_UP'] as const;
export type FormMissedPolicy = (typeof FormMissedPolicyValues)[number];

export const FormReviewActionValues = ['PASS', 'NEEDS_CHANGES', 'APPROVE', 'RETURN'] as const;
export type FormReviewAction = (typeof FormReviewActionValues)[number];

// ==========================================
// 1. Form Template Schema
// ==========================================
export const formTemplateSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  name: StringField({ required: true, max: 255 }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  isActive: BooleanField({ default: () => true }),
  createdBy: UUIDField({ required: true }),
});
export const createFormTemplateSchema = formTemplateSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormTemplateSchema = formTemplateSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormTemplateEntity = z.infer<typeof formTemplateSchema>;
export type CreateFormTemplate = z.infer<typeof createFormTemplateSchema>;
export type UpdateFormTemplate = z.infer<typeof updateFormTemplateSchema>;

// ==========================================
// 2. Form Version Schema
// ==========================================
export const formVersionSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formTemplateId: UUIDField({ required: true }),
  version: NumberField({ required: true }),
  status: EnumField(FormVersionStatusValues, { default: () => 'DRAFT' }),
  title: StringField({ required: true, max: 255 }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  createdBy: UUIDField({ required: true }),
  publishedBy: UUIDField({ required: false, nullable: true }),
  publishedAt: DateField({ required: false, nullable: true }),
});
export const createFormVersionSchema = formVersionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormVersionSchema = formVersionSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormVersionEntity = z.infer<typeof formVersionSchema>;
export type CreateFormVersion = z.infer<typeof createFormVersionSchema>;
export type UpdateFormVersion = z.infer<typeof updateFormVersionSchema>;

// ==========================================
// 3. Form Section Schema
// ==========================================
export const formSectionSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  title: StringField({ required: true, max: 255 }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  sortOrder: NumberField({ default: () => 0 }),
});
export const createFormSectionSchema = formSectionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormSectionSchema = formSectionSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormSectionEntity = z.infer<typeof formSectionSchema>;
export type CreateFormSection = z.infer<typeof createFormSectionSchema>;
export type UpdateFormSection = z.infer<typeof updateFormSectionSchema>;

// ==========================================
// 4. Form Field Schema
// ==========================================
export const formFieldSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  formSectionId: UUIDField({ required: true }),
  type: EnumField(FormFieldTypeValues, { required: true }),
  label: StringField({ required: true, max: 255 }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  isRequired: BooleanField({ default: () => false }),
  sortOrder: NumberField({ default: () => 0 }),
  config: z.record(z.string(), z.unknown()).default({}),
});
export const createFormFieldSchema = formFieldSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormFieldSchema = formFieldSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormFieldEntity = z.infer<typeof formFieldSchema>;
export type CreateFormField = z.infer<typeof createFormFieldSchema>;
export type UpdateFormField = z.infer<typeof updateFormFieldSchema>;

// ==========================================
// 5. Form Plan Schema
// ==========================================
const baseFormPlanSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formTemplateId: UUIDField({ required: true }),
  supersedesPlanId: UUIDField({ required: false, nullable: true }),
  name: StringField({ required: true, max: 255 }),
  scheduleKind: EnumField(FormScheduleKindValues, { required: true }),
  scheduleConfig: z.record(z.string(), z.unknown()).nullable(),
  timezone: StringField({ required: true, max: 255 }),
  fixedVersionId: UUIDField({ required: false, nullable: true }),
  reviewMode: EnumField(FormReviewModeValues, { default: () => 'OVERALL' }),
  latePolicy: EnumField(FormLatePolicyValues, { default: () => 'DENY' }),
  missedPolicy: EnumField(FormMissedPolicyValues, { default: () => 'SKIP' }),
  effectiveFrom: DateField({ required: false, nullable: true }),
  effectiveUntil: DateField({ required: false, nullable: true }),
  createdBy: UUIDField({ required: true }),
  closedBy: UUIDField({ required: false, nullable: true }),
  revision: NumberField({ default: () => 1 }).refine((r) => r > 0),
});

export const formPlanSchema = baseFormPlanSchema.refine(
  data => (data.scheduleKind === 'RECURRING' && data.scheduleConfig !== null) || (data.scheduleKind === 'EXPLICIT' && data.scheduleConfig === null),
  { message: 'scheduleConfig required if RECURRING, null if EXPLICIT' },
);
export const createFormPlanSchema = baseFormPlanSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine(
    data => (data.scheduleKind === 'RECURRING' && data.scheduleConfig !== null) || (data.scheduleKind === 'EXPLICIT' && data.scheduleConfig === null),
    { message: 'scheduleConfig required if RECURRING, null if EXPLICIT' },
  );
export const updateFormPlanSchema = baseFormPlanSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormPlanEntity = z.infer<typeof formPlanSchema>;
export type CreateFormPlan = z.infer<typeof createFormPlanSchema>;
export type UpdateFormPlan = z.infer<typeof updateFormPlanSchema>;

// ==========================================
// 6. Form Plan Target Schema
// ==========================================
const baseFormPlanTargetSchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  planId: UUIDField({ required: true }),
  roleId: UUIDField({ required: false, nullable: true }),
  companyMemberId: UUIDField({ required: false, nullable: true }),
  roleDistribution: EnumField(FormRoleDistributionValues, { required: false, nullable: true }),
});

export const formPlanTargetSchema = baseFormPlanTargetSchema.refine(
  data => (data.roleId != null && data.companyMemberId == null && data.roleDistribution != null) || (data.roleId == null && data.companyMemberId != null && data.roleDistribution == null),
  { message: 'XOR(roleId, companyMemberId) and roleDistribution required iff roleId' },
);
export const createFormPlanTargetSchema = baseFormPlanTargetSchema
  .omit({ id: true, createdAt: true })
  .refine(
    data => (data.roleId != null && data.companyMemberId == null && data.roleDistribution != null) || (data.roleId == null && data.companyMemberId != null && data.roleDistribution == null),
    { message: 'XOR(roleId, companyMemberId) and roleDistribution required iff roleId' },
  );
export type FormPlanTargetEntity = z.infer<typeof formPlanTargetSchema>;
export type CreateFormPlanTarget = z.infer<typeof createFormPlanTargetSchema>;

// ==========================================
// 7. Form Plan Period Schema
// ==========================================
const baseFormPlanPeriodSchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  planId: UUIDField({ required: true }),
  opensAt: DateField({ required: true }),
  dueAt: DateField({ required: true }),
});

export const formPlanPeriodSchema = baseFormPlanPeriodSchema.refine(
  data => data.dueAt > data.opensAt,
  { message: 'dueAt > opensAt' },
);
export const createFormPlanPeriodSchema = baseFormPlanPeriodSchema
  .omit({ id: true, createdAt: true })
  .refine(
    data => data.dueAt > data.opensAt,
    { message: 'dueAt > opensAt' },
  );
export type FormPlanPeriodEntity = z.infer<typeof formPlanPeriodSchema>;
export type CreateFormPlanPeriod = z.infer<typeof createFormPlanPeriodSchema>;

// ==========================================
// 8. Form Occurrence Schema
// ==========================================
const baseFormOccurrenceSchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  planId: UUIDField({ required: true }),
  formTemplateId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  periodId: UUIDField({ required: false, nullable: true }),
  occurrenceKey: StringField({ required: true, max: 255 }),
  opensAt: DateField({ required: true }),
  dueAt: DateField({ required: true }),
  cancelledAt: DateField({ required: false, nullable: true }),
  cancelledBy: UUIDField({ required: false, nullable: true }),
  cancelReason: StringField({ required: false, nullable: true }),
  revision: NumberField({ default: () => 1 }).refine((r) => r > 0),
});

export const formOccurrenceSchema = baseFormOccurrenceSchema.refine(
  data => (data.cancelledAt == null && data.cancelledBy == null && data.cancelReason == null) || (data.cancelledAt != null && data.cancelledBy != null && data.cancelReason != null),
  { message: 'Cancel fields all-or-none' },
);
export const createFormOccurrenceSchema = baseFormOccurrenceSchema.omit({ id: true, createdAt: true });
export const updateFormOccurrenceSchema = baseFormOccurrenceSchema.partial().omit({ id: true, createdAt: true }); // specifically for cancel
export type FormOccurrenceEntity = z.infer<typeof formOccurrenceSchema>;
export type CreateFormOccurrence = z.infer<typeof createFormOccurrenceSchema>;
export type UpdateFormOccurrence = z.infer<typeof updateFormOccurrenceSchema>;

// ==========================================
// 9. Form Assignment Schema
// ==========================================
const baseFormAssignmentSchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  occurrenceId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  roleId: UUIDField({ required: false, nullable: true }),
  companyMemberId: UUIDField({ required: false, nullable: true }),
  replacesAssignmentId: UUIDField({ required: false, nullable: true }),
  assignedBy: UUIDField({ required: false, nullable: true }),
  cancelledAt: DateField({ required: false, nullable: true }),
  cancelledBy: UUIDField({ required: false, nullable: true }),
  cancelReason: StringField({ required: false, nullable: true }),
  revision: NumberField({ default: () => 1 }).refine((r) => r > 0),
});

export const formAssignmentSchema = baseFormAssignmentSchema.refine(
  data => (data.roleId != null && data.companyMemberId == null) || (data.roleId == null && data.companyMemberId != null),
  { message: 'XOR role/member' },
);
export const createFormAssignmentSchema = baseFormAssignmentSchema.omit({ id: true, createdAt: true });
export const updateFormAssignmentSchema = baseFormAssignmentSchema.partial().omit({ id: true, createdAt: true }); // specifically for cancel
export type FormAssignmentEntity = z.infer<typeof formAssignmentSchema>;
export type CreateFormAssignment = z.infer<typeof createFormAssignmentSchema>;
export type UpdateFormAssignment = z.infer<typeof updateFormAssignmentSchema>;

// ==========================================
// 10. Form Submission Schema
// ==========================================
const baseFormSubmissionSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  assignmentId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  startedBy: UUIDField({ required: true }),
  submittedBy: UUIDField({ required: false, nullable: true }),
  revision: NumberField({ default: () => 1 }).refine((rev) => rev > 0),
  supersedesSubmissionId: UUIDField({ required: false, nullable: true }),
  submittedAt: DateField({ required: false, nullable: true }),
});

export const formSubmissionSchema = baseFormSubmissionSchema
  .refine((data) => (data.submittedAt == null) === (data.submittedBy == null))
  .refine(data => data.submittedAt == null || data.createdAt == null || data.submittedAt >= data.createdAt)
  .refine(data => data.supersedesSubmissionId == null || data.id == null || data.supersedesSubmissionId !== data.id);

export const createFormSubmissionSchema = baseFormSubmissionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormSubmissionSchema = baseFormSubmissionSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormSubmissionEntity = z.infer<typeof formSubmissionSchema>;
export type CreateFormSubmission = z.infer<typeof createFormSubmissionSchema>;
export type UpdateFormSubmission = z.infer<typeof updateFormSubmissionSchema>;

// ==========================================
// 11. Form Submission Contributor Schema
// ==========================================
export const formSubmissionContributorSchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  memberId: UUIDField({ required: true }),
});
export const createFormSubmissionContributorSchema = formSubmissionContributorSchema.omit({ id: true, createdAt: true });
export type FormSubmissionContributorEntity = z.infer<typeof formSubmissionContributorSchema>;
export type CreateFormSubmissionContributor = z.infer<typeof createFormSubmissionContributorSchema>;

// ==========================================
// 12. Form Answer Schema
// ==========================================
export const formAnswerSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  fieldId: UUIDField({ required: true }),
  value: z.unknown().optional().nullable(),
  updatedBy: UUIDField({ required: true }),
});
export const createFormAnswerSchema = formAnswerSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFormAnswerSchema = formAnswerSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });
export type FormAnswerEntity = z.infer<typeof formAnswerSchema>;
export type CreateFormAnswer = z.infer<typeof createFormAnswerSchema>;
export type UpdateFormAnswer = z.infer<typeof updateFormAnswerSchema>;

// ==========================================
// 13. Form Answer Attachment Schema
// ==========================================
export const formAnswerAttachmentSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  answerId: UUIDField({ required: true }),
  storageKey: StringField({ required: true, max: 1000 }),
  originalName: StringField({ required: true, max: 255 }),
  mimeType: StringField({ required: true, max: 100 }),
  sizeBytes: NumberField({ required: true }).refine((s) => s > 0),
  sortOrder: NumberField({ default: () => 0 }).refine((s) => s >= 0),
  uploadedBy: UUIDField({ required: true }),
});
export const createFormAnswerAttachmentSchema = formAnswerAttachmentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type FormAnswerAttachmentEntity = z.infer<typeof formAnswerAttachmentSchema>;
export type CreateFormAnswerAttachment = z.infer<typeof createFormAnswerAttachmentSchema>;

// ==========================================
// 14. Form Review Entry Schema
// ==========================================
const baseFormReviewEntrySchema = AppendOnlyBaseEntity({
  companyId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  answerId: UUIDField({ required: false, nullable: true }),
  sectionId: UUIDField({ required: false, nullable: true }),
  action: EnumField(FormReviewActionValues, { required: true }),
  note: StringField({ required: false, nullable: true }),
  reviewedBy: UUIDField({ required: true }),
  supersedesEntryId: UUIDField({ required: false, nullable: true }),
});

export const formReviewEntrySchema = baseFormReviewEntrySchema
  .refine(data => {
    const hasTarget = (data.answerId != null ? 1 : 0) + (data.sectionId != null ? 1 : 0);
    if (['PASS', 'NEEDS_CHANGES'].includes(data.action)) return hasTarget === 1;
    if (['APPROVE', 'RETURN'].includes(data.action)) return hasTarget === 0 && data.supersedesEntryId == null;
    return false;
  })
  .refine(data => !['NEEDS_CHANGES', 'RETURN'].includes(data.action) || (data.note != null && data.note.trim().length > 0));

export const createFormReviewEntrySchema = baseFormReviewEntrySchema
  .omit({ id: true, createdAt: true })
  .refine(data => {
    const hasTarget = (data.answerId != null ? 1 : 0) + (data.sectionId != null ? 1 : 0);
    if (['PASS', 'NEEDS_CHANGES'].includes(data.action)) return hasTarget === 1;
    if (['APPROVE', 'RETURN'].includes(data.action)) return hasTarget === 0 && data.supersedesEntryId == null;
    return false;
  })
  .refine(data => !['NEEDS_CHANGES', 'RETURN'].includes(data.action) || (data.note != null && data.note.trim().length > 0));

export type FormReviewEntryEntity = z.infer<typeof formReviewEntrySchema>;
export type CreateFormReviewEntry = z.infer<typeof createFormReviewEntrySchema>;

// ==========================================
// Reorder Schema (shared for sections & fields)
// ==========================================
export const reorderFormItemsSchema = z.object({
  formVersionId: z.string().uuid(),
  items: z.array(z.object({ id: z.string().uuid(), sortOrder: z.number().int().min(0) })).min(1).refine(items => new Set(items.map(i => i.id)).size === items.length).refine(items => {
    const orders = new Set(items.map(i => i.sortOrder));
    return orders.size === items.length && items.every(i => i.sortOrder < items.length);
  }),
});
export type ReorderFormItems = z.infer<typeof reorderFormItemsSchema>;

export const editFormFieldSchema = formFieldSchema.pick({
  formSectionId: true, type: true, label: true, description: true, isRequired: true, config: true,
}).strict();
export type EditFormField = z.infer<typeof editFormFieldSchema>;

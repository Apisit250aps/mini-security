import { z } from 'zod';
import {
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

export const FormVersionStatusValues = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const;
export type FormVersionStatus = (typeof FormVersionStatusValues)[number];

export const FormFieldTypeValues = [
  'TEXT',
  'NUMBER',
  'SELECT',
  'BOOLEAN',
  'DATE',
  'IMAGE',
  'FILE',
] as const;
export type FormFieldType = (typeof FormFieldTypeValues)[number];

export const FormSubmissionStatusValues = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
] as const;
export type FormSubmissionStatus = (typeof FormSubmissionStatusValues)[number];

export const SubmissionReviewActionValues = ['APPROVE', 'REJECT'] as const;
export type SubmissionReviewAction =
  (typeof SubmissionReviewActionValues)[number];

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

export const createFormTemplateSchema = formTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormTemplateSchema = formTemplateSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormTemplateEntity = z.infer<typeof formTemplateSchema>;
export type CreateFormTemplate = z.infer<typeof createFormTemplateSchema>;
export type UpdateFormTemplate = z.infer<typeof updateFormTemplateSchema>;

// ==========================================
// 2. Form Template Role Schema
// ==========================================

export const formTemplateRoleSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formTemplateId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  isEnabled: BooleanField({ default: () => true }),
});

export const createFormTemplateRoleSchema = formTemplateRoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormTemplateRoleSchema = formTemplateRoleSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormTemplateRoleEntity = z.infer<typeof formTemplateRoleSchema>;
export type CreateFormTemplateRole = z.infer<
  typeof createFormTemplateRoleSchema
>;
export type UpdateFormTemplateRole = z.infer<
  typeof updateFormTemplateRoleSchema
>;

// ==========================================
// 3. Form Version Schema
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

export const createFormVersionSchema = formVersionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormVersionSchema = formVersionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormVersionEntity = z.infer<typeof formVersionSchema>;
export type CreateFormVersion = z.infer<typeof createFormVersionSchema>;
export type UpdateFormVersion = z.infer<typeof updateFormVersionSchema>;

// ==========================================
// 4. Form Section Schema
// ==========================================

export const formSectionSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  title: StringField({ required: true, max: 255 }),
  description: StringField({ required: false, nullable: true, max: 1000 }),
  sortOrder: NumberField({ default: () => 0 }),
});

export const createFormSectionSchema = formSectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormSectionSchema = formSectionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormSectionEntity = z.infer<typeof formSectionSchema>;
export type CreateFormSection = z.infer<typeof createFormSectionSchema>;
export type UpdateFormSection = z.infer<typeof updateFormSectionSchema>;

// ==========================================
// 5. Form Field Schema
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

export const createFormFieldSchema = formFieldSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormFieldSchema = formFieldSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormFieldEntity = z.infer<typeof formFieldSchema>;
export type CreateFormField = z.infer<typeof createFormFieldSchema>;
export type UpdateFormField = z.infer<typeof updateFormFieldSchema>;

// ==========================================
// 6. Form Submission Schema
// ==========================================

export const formSubmissionSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formTemplateId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  roleId: UUIDField({ required: true }),
  startedBy: UUIDField({ required: true }),
  submittedBy: UUIDField({ required: false, nullable: true }),
  revision: NumberField({ default: () => 1 }),
  supersedesSubmissionId: UUIDField({ required: false, nullable: true }),
  status: EnumField(FormSubmissionStatusValues, { default: () => 'DRAFT' }),
  startedAt: DateField({ default: () => new Date() }),
  submittedAt: DateField({ required: false, nullable: true }),
});

export const createFormSubmissionSchema = formSubmissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormSubmissionSchema = formSubmissionSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormSubmissionEntity = z.infer<typeof formSubmissionSchema>;
export type CreateFormSubmission = z.infer<typeof createFormSubmissionSchema>;
export type UpdateFormSubmission = z.infer<typeof updateFormSubmissionSchema>;

// ==========================================
// 7. Form Submission Contributor Schema
// ==========================================

export const formSubmissionContributorSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  memberId: UUIDField({ required: true }),
});

export const createFormSubmissionContributorSchema =
  formSubmissionContributorSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type FormSubmissionContributorEntity = z.infer<
  typeof formSubmissionContributorSchema
>;
export type CreateFormSubmissionContributor = z.infer<
  typeof createFormSubmissionContributorSchema
>;

// ==========================================
// 8. Form Answer Schema
// ==========================================

export const formAnswerSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  formVersionId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  fieldId: UUIDField({ required: true }),
  value: z.unknown().optional().nullable(),
  updatedBy: UUIDField({ required: true }),
});

export const createFormAnswerSchema = formAnswerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFormAnswerSchema = formAnswerSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type FormAnswerEntity = z.infer<typeof formAnswerSchema>;
export type CreateFormAnswer = z.infer<typeof createFormAnswerSchema>;
export type UpdateFormAnswer = z.infer<typeof updateFormAnswerSchema>;

// ==========================================
// 9. Form Answer Attachment Schema
// ==========================================

export const formAnswerAttachmentSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  answerId: UUIDField({ required: true }),
  storageKey: StringField({ required: true, max: 1000 }),
  originalName: StringField({ required: true, max: 255 }),
  mimeType: StringField({ required: true, max: 100 }),
  sizeBytes: NumberField({ required: true }),
  sortOrder: NumberField({ default: () => 0 }),
  uploadedBy: UUIDField({ required: true }),
});

export const createFormAnswerAttachmentSchema = formAnswerAttachmentSchema.omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  },
);

export type FormAnswerAttachmentEntity = z.infer<
  typeof formAnswerAttachmentSchema
>;
export type CreateFormAnswerAttachment = z.infer<
  typeof createFormAnswerAttachmentSchema
>;

// ==========================================
// 10. Submission Review Schema
// ==========================================

export const submissionReviewSchema = BaseEntity({
  companyId: UUIDField({ required: true }),
  submissionId: UUIDField({ required: true }),
  reviewedBy: UUIDField({ required: true }),
  action: EnumField(SubmissionReviewActionValues, { required: true }),
  note: StringField({ required: false, nullable: true, max: 1000 }),
});

export const createSubmissionReviewSchema = submissionReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SubmissionReviewEntity = z.infer<typeof submissionReviewSchema>;
export type CreateSubmissionReview = z.infer<
  typeof createSubmissionReviewSchema
>;

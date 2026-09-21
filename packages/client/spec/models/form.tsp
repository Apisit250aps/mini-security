namespace MiniSecurity;

// ─── FormTemplate ─────────────────────────────────────────────────────────────
model FormTemplate is Domain.Entity.FormTemplate;

model CreateFormTemplate is OmitProperties<
  FormTemplate,
  "id" | "createdAt" | "updatedAt"
>;

model UpdateFormTemplate
  is OptionalProperties<OmitProperties<
    FormTemplate,
    "id" | "createdAt" | "updatedAt"
  >>;

// ─── FormVersion ──────────────────────────────────────────────────────────────
model FormVersion is Domain.Entity.FormVersion;

model PublishFormVersionRequest {
  memberId: string;
}

// ─── FormSection ──────────────────────────────────────────────────────────────
model FormSection is Domain.Entity.FormSection;

model CreateFormSection is OmitProperties<
  FormSection,
  "id" | "createdAt" | "updatedAt"
>;

// ─── FormField ────────────────────────────────────────────────────────────────
model FormField is Domain.Entity.FormField;

model FormFieldOption is Domain.Entity.FormFieldOption;

model FormFieldOptionInput {
  label: string;
  value: string;
  sortOrder?: int32;
}

model CreateFormField extends OmitProperties<
  FormField,
  "id" | "createdAt" | "updatedAt" | "options"
> {
  options?: FormFieldOptionInput[];
}

// ─── FormAnswer & Attachment ──────────────────────────────────────────────────
model FormAnswer is Domain.Entity.FormAnswer;
model FormAnswerAttachment is Domain.Entity.FormAnswerAttachment;

// ─── FormSubmission ───────────────────────────────────────────────────────────
model FormSubmission is Domain.Entity.FormSubmission;
model FormSubmissionContributor is Domain.Entity.FormSubmissionContributor;

model StartFormSubmissionRequest {
  assignmentId: string;
}

model AnswerInput {
  fieldId: string;
  value?: unknown;
}

model SaveFormSubmissionDraftRequest {
  expectedRevision: int32;
  answers: AnswerInput[];
}

model SubmitFormSubmissionRequest {
  expectedRevision: int32;
}

// ─── Form Plans & Occurrences ──────────────────────────────────────────────────

model CreateFormPlanRequest {
  data: PickProperties<
    Domain.Entity.FormPlan,
    | "organizationId"
    | "formTemplateId"
    | "name"
    | "scheduleKind"
    | "scheduleConfig"
    | "timezone"
    | "fixedVersionId"
    | "latePolicy"
    | "missedPolicy"
  >;
  targets: CreateFormPlanTarget[];
  periods?: CreateFormPlanPeriod[];
}

model UpdateFormPlanRequest {
  expectedRevision: int32;
  data: OptionalProperties<PickProperties<
    Domain.Entity.FormPlan,
    | "name"
    | "scheduleKind"
    | "scheduleConfig"
    | "timezone"
    | "fixedVersionId"
    | "latePolicy"
    | "missedPolicy"
  >>;
  targets?: CreateFormPlanTarget[];
  periods?: CreateFormPlanPeriod[];
}

model CreateFormPlanTarget {
  roleId?: string;
  organizationMemberId?: string;
  roleDistribution?: Domain.Entity.FormRoleDistribution;
}

model CreateFormPlanPeriod {
  opensAt: utcDateTime;
  dueAt: utcDateTime;
}

model ActivatePlanRequest {
  expectedRevision: int32;
}

model PausePlanRequest {
  expectedRevision: int32;
}

model CancelOccurrenceRequest {
  cancelReason: string;
  expectedRevision: int32;
}

model OpenOccurrencesRequest {
  organizationId: string;
}

model CancelAssignmentRequest {
  cancelReason: string;
  expectedRevision: int32;
}

model ReplaceAssignmentRequest {
  cancelReason: string;
  newOrganizationMemberId?: string;
  newRoleId?: string;
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

model RecordReviewRequest {
  expectedRevision: int32;
  action: Domain.Entity.FormReviewAction;
  note?: string;
  supersedesEntryId?: string;
}

model FinalizeReviewRequest {
  expectedRevision: int32;
  action: Domain.Entity.FormReviewAction;
  note?: string;
}

// ─── Details Models ───────────────────────────────────────────────────────────
model FormPlanDetail {
  plan: Domain.Entity.FormPlan;
  targets: Domain.Entity.FormPlanTarget[];
  periods: Domain.Entity.FormPlanPeriod[];
}

model FormTemplateDetail {
  template: FormTemplate;
  activeVersion: FormVersion | null;
  draftVersion: FormVersion | null;
  sections: FormSection[];
  fields: FormField[];
}

model FormSubmissionDetail {
  submission: FormSubmission;
  template: FormTemplate | null;
  version: FormVersion | null;
  sections: FormSection[];
  fields: FormField[];
  answers: FormAnswer[];
  attachments: FormAnswerAttachment[];
  contributors: FormSubmissionContributor[];
}

model ReorderFormItemsRequest {
  formVersionId: string;

  @minItems(1)
  items: FormReorderItem[];
}
model FormReorderItem {
  id: string;

  @minValue(0)
  sortOrder: int32;
}

model EditFormField extends PickProperties<
  FormField,
  | "formSectionId"
  | "name"
  | "type"
  | "label"
  | "description"
  | "placeholder"
  | "isRequired"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
> {
  options?: FormFieldOptionInput[];
}

enum FormTaskWorkflowStatus {
  NOT_STARTED: "NOT_STARTED",
  DRAFT: "DRAFT",
  IN_REVIEW: "IN_REVIEW",
  RETURNED: "RETURNED",
  CORRECTION_DRAFT: "CORRECTION_DRAFT",
  APPROVED: "APPROVED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
}

model FormTaskAvailableActions {
  canStart: boolean;
  canContinue: boolean;
  canCreateCorrection: boolean;
  canView: boolean;
  disabledReason?: string;
}

model FormAssignmentItem extends Domain.Entity.FormAssignment {
  planId?: string;
  planName?: string;
  formTemplateId?: string;
  templateName?: string;
  templateDescription?: string;
  opensAt?: utcDateTime;
  dueAt?: utcDateTime;
  timezone?: string;
  latePolicy?: Domain.Entity.FormLatePolicy;
  assignmentType?: string;
  recipientLabel?: string;
  roleName?: string;
  memberName?: string;
  latestSubmissionId?: string;
  latestSubmissionRevision?: int32;
  workflowStatus?: FormTaskWorkflowStatus;
  isOverdue?: boolean;
  availableActions?: FormTaskAvailableActions;
}

model OccurrenceAssignmentItem {
  id: string;
  assignmentId: string;
  occurrenceId: string;
  organizationId: string;
  formVersionId: string;
  roleId?: string;
  organizationMemberId?: string;
  roleName?: string;
  memberName?: string;
  assignmentType: string;
  recipientLabel: string;
  workflowStatus: FormTaskWorkflowStatus;
  latestSubmissionId?: string;
  latestSubmissionRevision?: int32;
  isOverdue: boolean;
  canStart: boolean;
  canContinue: boolean;
  canCreateCorrection: boolean;
  canView: boolean;
  createdAt: utcDateTime;
}

model FormSubmissionItem extends Domain.Entity.FormSubmission {
  planId?: string;
  planName?: string;
  formTemplateId?: string;
  templateName?: string;
  occurrenceOpensAt?: utcDateTime;
  occurrenceDueAt?: utcDateTime;
  occurrenceKey?: string;
  recipientLabel?: string;
  startedByName?: string;
  submittedByName?: string;
  finalReviewAction?: Domain.Entity.FormReviewAction;
  finalReviewNote?: string;
  finalReviewAt?: utcDateTime;
  reviewerName?: string;
  submissionSequence?: int32;
  isLatest?: boolean;
}

model ReviewQueueItem extends Domain.Entity.FormSubmission {
  templateName?: string;
  submitterName?: string;
}

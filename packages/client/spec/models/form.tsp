namespace MiniSecurity;

// ─── FormTemplate ─────────────────────────────────────────────────────────────
model FormTemplate is Domain.Entity.FormTemplate;

model CreateFormTemplate
  is OmitProperties<FormTemplate, "id" | "createdAt" | "updatedAt">;

model UpdateFormTemplate
  is OptionalProperties<OmitProperties<FormTemplate, "id" | "createdAt" | "updatedAt">>;

// ─── FormVersion ──────────────────────────────────────────────────────────────
model FormVersion is Domain.Entity.FormVersion;

model PublishFormVersionRequest {
  memberId: string;
}

// ─── FormSection ──────────────────────────────────────────────────────────────
model FormSection is Domain.Entity.FormSection;

model CreateFormSection
  is OmitProperties<FormSection, "id" | "createdAt" | "updatedAt">;

// ─── FormField ────────────────────────────────────────────────────────────────
model FormField is Domain.Entity.FormField;

model CreateFormField
  is OmitProperties<FormField, "id" | "createdAt" | "updatedAt">;

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
  data: PickProperties<Domain.Entity.FormPlan, "companyId" | "formTemplateId" | "name" | "scheduleKind" | "scheduleConfig" | "timezone" | "fixedVersionId" | "reviewMode" | "latePolicy" | "missedPolicy">;
  targets: CreateFormPlanTarget[];
  periods?: CreateFormPlanPeriod[];
}

model UpdateFormPlanRequest {
  expectedRevision: int32;
  data: OptionalProperties<PickProperties<Domain.Entity.FormPlan, "name" | "scheduleKind" | "scheduleConfig" | "timezone" | "fixedVersionId" | "reviewMode" | "latePolicy" | "missedPolicy">>;
  targets?: CreateFormPlanTarget[];
  periods?: CreateFormPlanPeriod[];
}

model CreateFormPlanTarget {
  roleId?: string;
  companyMemberId?: string;
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
  companyId: string;
}

model CancelAssignmentRequest {
  cancelReason: string;
  expectedRevision: int32;
}

model ReplaceAssignmentRequest {
  cancelReason: string;
  newCompanyMemberId?: string;
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

model EditFormField is PickProperties<FormField, "formSectionId" | "type" | "label" | "description" | "isRequired" | "config">;

model FormAssignmentItem extends Domain.Entity.FormAssignment {
  templateName?: string;
  templateDescription?: string;
  opensAt?: utcDateTime;
  dueAt?: utcDateTime;
  roleName?: string;
}

model ReviewQueueItem extends Domain.Entity.FormSubmission {
  templateName?: string;
  submitterName?: string;
}

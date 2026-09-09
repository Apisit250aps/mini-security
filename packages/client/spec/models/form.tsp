namespace MiniSecurity;

// ─── FormTemplate ─────────────────────────────────────────────────────────────
model FormTemplate is Domain.Entity.FormTemplate;

model CreateFormTemplate
  is OmitProperties<FormTemplate, "id" | "createdAt" | "updatedAt">;

model UpdateFormTemplate
  is OptionalProperties<OmitProperties<FormTemplate, "id" | "createdAt" | "updatedAt">>;

// ─── FormTemplateRole ─────────────────────────────────────────────────────────
model FormTemplateRole is Domain.Entity.FormTemplateRole;

model AssignFormRolesRequest {
  roleIds: string[];
}

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
  formTemplateId: string;
  roleId: string;
  memberId: string;
}

model AnswerInput {
  fieldId: string;
  value?: unknown;
}

model SaveFormSubmissionDraftRequest {
  memberId: string;
  expectedRevision: int32;
  answers: AnswerInput[];
}

model SubmitFormSubmissionRequest {
  memberId: string;
  expectedRevision: int32;
}

model CloneFormSubmissionRequest {
  memberId: string;
}

// ─── SubmissionReview ─────────────────────────────────────────────────────────
model SubmissionReview is Domain.Entity.SubmissionReview;

model ReviewFormSubmissionRequest {
  memberId: string;
  action: Domain.Entity.SubmissionReviewAction;
  note?: string;
}

// ─── Details Models ───────────────────────────────────────────────────────────
model FormTemplateDetail {
  template: FormTemplate;
  activeVersion: FormVersion | null;
  draftVersion: FormVersion | null;
  roles: FormTemplateRole[];
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
  contributors: FormSubmissionContributor[];
  review: SubmissionReview | null;
}

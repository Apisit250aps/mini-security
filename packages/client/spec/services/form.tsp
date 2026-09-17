import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/forms")
@tag("Form")
interface FormServices {
  // ─── Templates & Builder ──────────────────────────────────────────────────
  @post
  @route("/templates")
  @summary("Create form template")
  createTemplate(@body body: CreateFormTemplate):
    | ApiCreatedResponse<FormTemplate>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/templates/{id}")
  @summary("Update form template")
  updateTemplate(@path id: string, @body body: UpdateFormTemplate):
    | ApiOkResponse<FormTemplate>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/templates/{id}")
  @summary("Get form template detail")
  getTemplate(@path id: string):
    | ApiOkResponse<FormTemplateDetail>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/templates")
  @summary("List company form templates")
  listTemplatesByCompany(@path companyId: string):
    | ApiOkResponse<FormTemplate[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/templates/{id}/sections")
  @summary("Create form section")
  createSection(@path id: string, @body body: CreateFormSection):
    | ApiCreatedResponse<FormSection>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/templates/{id}/fields")
  @summary("Create form field")
  createField(@path id: string, @body body: CreateFormField):
    | ApiCreatedResponse<FormField>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/templates/{id}/publish")
  @summary("Publish form version")
  publishVersion(@path id: string, @body body: PublishFormVersionRequest):
    | ApiOkResponse<FormVersion>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @patch
  @route("/templates/{id}/sections/reorder")
  @summary("Reorder form sections")
  reorderSections(@path id: string, @body body: ReorderFormItemsRequest):
    | ApiOkResponse<null>
    | ApiBadRequestResponse
    | ApiNotFoundResponse
    | ApiForbiddenResponse
    | ApiUnauthorizedResponse;

  @patch
  @route("/templates/{id}/fields/reorder")
  @summary("Reorder form fields")
  reorderFields(@path id: string, @body body: ReorderFormItemsRequest):
    | ApiOkResponse<null>
    | ApiBadRequestResponse
    | ApiNotFoundResponse
    | ApiForbiddenResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/templates/{id}/sections/{sectionId}")
  @summary("Delete form section")
  deleteSection(@path id: string, @path sectionId: string): ApiOkResponse<null> | ApiBadRequestResponse | ApiNotFoundResponse | ApiForbiddenResponse | ApiUnauthorizedResponse;

  @put
  @route("/templates/{id}/fields/{fieldId}")
  editField(@path id: string, @path fieldId: string, @body body: EditFormField): ApiOkResponse<FormField> | ApiBadRequestResponse | ApiNotFoundResponse | ApiForbiddenResponse | ApiUnauthorizedResponse;
  @delete
  @route("/templates/{id}/fields/{fieldId}")
  deleteField(@path id: string, @path fieldId: string): ApiOkResponse<null> | ApiBadRequestResponse | ApiNotFoundResponse | ApiForbiddenResponse | ApiUnauthorizedResponse;

  // ─── Plans ────────────────────────────────────────────────────────────────
  @post
  @route("/plans")
  @summary("Create form plan")
  createPlan(@body body: CreateFormPlanRequest): ApiCreatedResponse<Domain.Entity.FormPlan> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @get
  @route("/plans")
  @summary("List form plans")
  listPlans(@query companyId: string): ApiOkResponse<Domain.Entity.FormPlan[]> | ApiUnauthorizedResponse;

  @get
  @route("/plans/{id}")
  @summary("Get form plan")
  getPlan(@path id: string): ApiOkResponse<FormPlanDetail> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @put
  @route("/plans/{id}")
  @summary("Update form plan")
  updatePlan(@path id: string, @body body: UpdateFormPlanRequest): ApiOkResponse<Domain.Entity.FormPlan> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/plans/{id}/activate")
  @summary("Activate form plan")
  activatePlan(@path id: string, @body body: ActivatePlanRequest): ApiOkResponse<Domain.Entity.FormPlan> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/plans/{id}/pause")
  @summary("Pause form plan")
  pausePlan(@path id: string, @body body: PausePlanRequest): ApiOkResponse<Domain.Entity.FormPlan> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @get
  @route("/plans/{id}/schedule-preview")
  @summary("Preview form plan schedule")
  previewSchedule(@path id: string): ApiOkResponse<utcDateTime[]> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  // ─── Occurrences ─────────────────────────────────────────────────────────
  @get
  @route("/occurrences")
  @summary("List form occurrences")
  listOccurrences(
    @query companyId: string,
    @query formTemplateId?: string,
    @query planId?: string
  ): ApiOkResponse<Domain.Entity.FormOccurrence[]> | ApiUnauthorizedResponse;

  @post
  @route("/occurrences/open")
  @summary("Open due occurrences")
  openOccurrences(@body body: OpenOccurrencesRequest): ApiOkResponse<Domain.Entity.FormOccurrence[]> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/occurrences/{id}/cancel")
  @summary("Cancel occurrence")
  cancelOccurrence(@path id: string, @body body: CancelOccurrenceRequest): ApiOkResponse<Domain.Entity.FormOccurrence> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @get
  @route("/occurrences/{id}/assignments")
  @summary("List occurrence assignments")
  listOccurrenceAssignments(@path id: string): ApiOkResponse<OccurrenceAssignmentItem[]> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  // ─── Assignments ──────────────────────────────────────────────────────────
  @get
  @route("/assignments")
  @summary("List my assignments")
  listMyAssignments(@query companyId?: string, @query memberId?: string): ApiOkResponse<FormAssignmentItem[]> | ApiUnauthorizedResponse;

  @get
  @route("/assignments/{id}")
  @summary("Get assignment")
  getAssignment(@path id: string): ApiOkResponse<Domain.Entity.FormAssignment> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @post
  @route("/assignments/{id}/cancel")
  @summary("Cancel assignment")
  cancelAssignment(@path id: string, @body body: CancelAssignmentRequest): ApiOkResponse<Domain.Entity.FormAssignment> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/assignments/{id}/replace")
  @summary("Replace assignment")
  replaceAssignment(@path id: string, @body body: ReplaceAssignmentRequest): ApiOkResponse<Domain.Entity.FormAssignment> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/fields/{fieldId}/attachments")
  uploadAttachment(@path id: string, @path fieldId: string, @header contentType: "multipart/form-data", @multipartBody body: { file: HttpPart<File>; expectedRevision: HttpPart<int32>; }): ApiCreatedResponse<FormAnswerAttachment> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @get
  @route("/attachments/{attachmentId}")
  downloadAttachment(@path attachmentId: string): { @header contentType: string; @body body: bytes; } | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @delete
  @route("/attachments/{attachmentId}")
  deleteAttachment(@path attachmentId: string, @body body: SubmitFormSubmissionRequest): ApiOkBasicResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  // ─── Submissions ──────────────────────────────────────────────────────────
  @post
  @route("/submissions")
  @summary("Start new form submission (shared draft)")
  startSubmission(@body body: StartFormSubmissionRequest):
    | ApiCreatedResponse<FormSubmission>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/submissions/{id}/draft")
  @summary("Save form submission draft answers (optimistic lock)")
  saveDraft(@path id: string, @body body: SaveFormSubmissionDraftRequest):
    | ApiOkResponse<FormSubmission>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/submit")
  @summary("Submit completed form submission")
  submit(@path id: string, @body body: SubmitFormSubmissionRequest):
    | ApiOkResponse<FormSubmission>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/correction")
  @summary("Create correction draft for returned submission")
  createCorrection(@path id: string):
    | ApiCreatedResponse<FormSubmission>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/submissions/{id}")
  @summary("Get form submission detail")
  getSubmission(@path id: string):
    | ApiOkResponse<FormSubmissionDetail>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/submissions")
  @summary("List form submissions")
  listSubmissions(
    @query companyId?: string,
    @query assignmentId?: string,
  ):
    | ApiOkResponse<FormSubmissionItem[]>
    | ApiUnauthorizedResponse;

  // ─── Reviews ─────────────────────────────────────────────────────────────
  @get
  @route("/reviews")
  @summary("List review queue")
  listReviewQueue(@query companyId: string): ApiOkResponse<ReviewQueueItem[]> | ApiUnauthorizedResponse;

  @get
  @route("/submissions/{id}/review-entries")
  @summary("Get submission review entries")
  getReviewDetail(@path id: string): ApiOkResponse<Domain.Entity.FormReviewEntry[]> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/answers/{answerId}/review")
  @summary("Record answer review")
  recordAnswerReview(@path id: string, @path answerId: string, @body body: RecordReviewRequest): ApiCreatedResponse<Domain.Entity.FormReviewEntry> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/sections/{sectionId}/review")
  @summary("Record section review")
  recordSectionReview(@path id: string, @path sectionId: string, @body body: RecordReviewRequest): ApiCreatedResponse<Domain.Entity.FormReviewEntry> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/submissions/{id}/finalize-review")
  @summary("Finalize submission review")
  finalizeReview(@path id: string, @body body: FinalizeReviewRequest): ApiOkResponse<Domain.Entity.FormReviewEntry> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;
}

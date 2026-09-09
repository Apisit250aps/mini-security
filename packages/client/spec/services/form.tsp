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
  @route("/templates/{id}/roles")
  @summary("Assign roles to form template")
  assignRoles(@path id: string, @body body: AssignFormRolesRequest):
    | ApiOkResponse<FormTemplateRole[]>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
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
  @route("/submissions/{id}/clone")
  @summary("Clone rejected submission into new rework draft")
  clone(@path id: string, @body body: CloneFormSubmissionRequest):
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
    @query roleId?: string,
    @query formTemplateId?: string,
  ):
    | ApiOkResponse<FormSubmission[]>
    | ApiUnauthorizedResponse;

  // ─── Submission Review ────────────────────────────────────────────────────
  @post
  @route("/submissions/{id}/review")
  @summary("Review form submission (approve or reject as owner)")
  review(@path id: string, @body body: ReviewFormSubmissionRequest):
    | ApiOkResponse<SubmissionReview>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;
}

import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/leaves")
@tag("Leave")
interface LeaveServices {
  // ─── Leave Types ──────────────────────────────────────────────────────────
  @post
  @route("/types")
  @summary("Create leave type")
  createType(@body body: CreateLeaveType):
    | ApiCreatedResponse<LeaveType>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/types/{id}")
  @summary("Update leave type")
  updateType(@path id: string, @body body: UpdateLeaveType):
    | ApiOkResponse<LeaveType>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/organizations/{organizationId}/types")
  @summary("Get organization leave types")
  getTypesByOrganization(
    @path organizationId: string,
    @query onlyActive?: boolean,
  ):
    | ApiOkResponse<LeaveType[]>
    | ApiUnauthorizedResponse;

  // ─── Leave Quotas ─────────────────────────────────────────────────────────
  @post
  @route("/quotas")
  @summary("Create leave quota")
  createQuota(@body body: CreateLeaveQuota):
    | ApiCreatedResponse<LeaveQuota>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/quotas/{id}")
  @summary("Update leave quota")
  updateQuota(@path id: string, @body body: UpdateLeaveQuota):
    | ApiOkResponse<LeaveQuota>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/members/{memberId}/quotas/{year}")
  @summary("Get member leave quotas for year")
  getQuotasByMember(
    @path memberId: string,
    @path year: int32,
  ):
    | ApiOkResponse<LeaveQuota[]>
    | ApiUnauthorizedResponse;

  // ─── Leave Requests ───────────────────────────────────────────────────────
  @post
  @route("/requests")
  @summary("Submit leave request")
  submitRequest(@body body: CreateLeaveRequest):
    | ApiCreatedResponse<LeaveRequest>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/requests/{id}/review")
  @summary("Review leave request (approve / reject)")
  reviewRequest(@path id: string, @body body: ReviewLeaveRequestRequest):
    | ApiOkResponse<LeaveRequest>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/requests/{id}/cancel")
  @summary("Cancel leave request")
  cancelRequest(@path id: string):
    | ApiOkResponse<LeaveRequest>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/members/{memberId}/requests")
  @summary("Get member leave requests")
  getMemberRequests(@path memberId: string):
    | ApiOkResponse<LeaveRequest[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/organizations/{organizationId}/requests")
  @summary("Get organization leave requests")
  getOrganizationRequests(
    @path organizationId: string,
    @query status?: string,
  ):
    | ApiOkResponse<LeaveRequest[]>
    | ApiUnauthorizedResponse;
}

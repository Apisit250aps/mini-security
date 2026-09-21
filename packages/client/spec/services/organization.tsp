import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/organizations")
@tag("Organization")
interface OrganizationServices {
  @get
  @route("/")
  @summary("Get all organizations")
  getOrganizations(): ApiOkResponse<Organization[]> | ApiUnauthorizedResponse;

  @get
  @route("/{id}")
  @summary("Get organization by ID")
  getOrganization(@path id: string):
    | ApiOkResponse<Organization>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/slug/{slug}")
  @summary("Get organization by slug")
  getOrganizationBySlug(@path slug: string):
    | ApiOkResponse<Organization>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/")
  @summary("Create new organization")
  createOrganization(@body body: CreateOrganization):
    | ApiCreatedResponse<Organization>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update organization")
  updateOrganization(@path id: string, @body body: UpdateOrganization):
    | ApiOkResponse<Organization>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete organization")
  deleteOrganization(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Organization Members ───────────────────────────────────────────────────
  @get
  @route("/{organizationId}/members")
  @summary("Get organization members")
  getOrganizationMembers(@path organizationId: string):
    | ApiOkResponse<OrganizationMember[]>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/members")
  @summary("Add organization member")
  addOrganizationMember(@body body: CreateOrganizationMember):
    | ApiCreatedResponse<OrganizationMember>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/members/{id}")
  @summary("Update organization member")
  updateOrganizationMember(@path id: string, @body body: UpdateOrganizationMember):
    | ApiOkResponse<OrganizationMember>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/members/{id}")
  @summary("Remove organization member")
  removeOrganizationMember(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Sites ─────────────────────────────────────────────────────────────────
  @get
  @route("/{organizationId}/sites")
  @summary("Get organization sites")
  getSites(@path organizationId: string):
    | ApiOkResponse<Site[]>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/sites/{id}")
  @summary("Get site by ID")
  getSite(@path id: string):
    | ApiOkResponse<Site>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/sites")
  @summary("Create site")
  createSite(@body body: CreateSite):
    | ApiCreatedResponse<Site>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/sites/{id}")
  @summary("Update site")
  updateSite(@path id: string, @body body: UpdateSite):
    | ApiOkResponse<Site>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/sites/{id}")
  @summary("Delete site")
  deleteSite(@path id: string, @query organizationId?: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/{id}/switch")
  @summary("Switch active organization for the current session")
  switchActiveOrganization(@path id: string):
    | ApiOkResponse<SwitchActiveOrganizationResponse>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;
}

import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/features")
@tag("Feature")
interface FeatureServices {
  // ─── Master Feature Catalog ───────────────────────────────────────────────
  @get
  @route("/")
  @summary("Get all features")
  getFeatures(@query category?: string, @query isActive?: boolean):
    | ApiOkResponse<Feature[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/{id}")
  @summary("Get feature by id")
  getFeature(@path id: string):
    | ApiOkResponse<Feature>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/")
  @summary("Create feature")
  createFeature(@body body: CreateFeature):
    | ApiCreatedResponse<Feature>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update feature")
  updateFeature(@path id: string, @body body: UpdateFeature):
    | ApiOkResponse<Feature>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}/toggle")
  @summary("Toggle feature active state")
  toggleFeature(@path id: string, @body body: ToggleFeatureRequest):
    | ApiOkResponse<Feature>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Organization Features ──────────────────────────────────────────────────
  @get
  @route("/organizations/{organizationId}")
  @summary("Get organization features")
  getOrganizationFeatures(
    @path organizationId: string,
    @query onlyEnabled?: boolean,
  ): ApiOkResponse<OrganizationFeature[]> | ApiUnauthorizedResponse;

  @get
  @route("/organizations/{organizationId}/available")
  @summary("Get available features for organization")
  getOrganizationAvailableFeatures(@path organizationId: string):
    | ApiOkResponse<Feature[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/organizations/{organizationId}/assign")
  @summary("Assign feature to organization")
  assignOrganizationFeature(
    @path organizationId: string,
    @body body: CreateOrganizationFeature,
  ): ApiCreatedResponse<OrganizationFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @put
  @route("/organizations/{organizationId}/toggle")
  @summary("Toggle organization feature")
  toggleOrganizationFeature(
    @path organizationId: string,
    @body body: OrganizationToggleFeatureRequest,
  ): ApiOkResponse<OrganizationFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @delete
  @route("/organizations/{organizationId}/features/{featureId}")
  @summary("Remove feature from organization")
  removeOrganizationFeature(
    @path organizationId: string,
    @path featureId: string,
  ): ApiOkBasicResponse | ApiUnauthorizedResponse;

  // ─── Role Features ─────────────────────────────────────────────────────────
  @get
  @route("/organizations/{organizationId}/roles")
  @summary("Get role features for organization")
  getOrganizationRoleFeatures(@path organizationId: string):
    | ApiOkResponse<RoleFeature[]>
    | ApiUnauthorizedResponse;

  @get
  @route("/roles/{roleId}")
  @summary("Get features for a role")
  getRoleFeatures(@path roleId: string):
    | ApiOkResponse<Feature[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/roles/{roleId}/assign")
  @summary("Assign feature to role")
  assignRoleFeature(
    @path roleId: string,
    @body body: CreateRoleFeature,
  ): ApiCreatedResponse<RoleFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @put
  @route("/roles/{roleId}/toggle")
  @summary("Toggle role feature")
  toggleRoleFeature(
    @path roleId: string,
    @body body: RoleToggleFeatureRequest,
  ): ApiOkResponse<RoleFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @delete
  @route("/roles/{roleId}/features/{featureId}")
  @summary("Revoke feature from role")
  revokeRoleFeature(
    @path roleId: string,
    @path featureId: string,
    @query organizationId?: string,
  ): ApiOkBasicResponse | ApiUnauthorizedResponse;

  @get
  @route("/organizations/{organizationId}/roles/{roleId}/access/{featureCode}")
  @summary("Check role feature access")
  checkRoleFeatureAccess(
    @path organizationId: string,
    @path roleId: string,
    @path featureCode: string,
  ): ApiOkResponse<FeatureAccessResponse> | ApiUnauthorizedResponse;
}

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

  // ─── Company Features ───────────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}")
  @summary("Get company features")
  getCompanyFeatures(
    @path companyId: string,
    @query onlyEnabled?: boolean,
  ): ApiOkResponse<CompanyFeature[]> | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/available")
  @summary("Get available features for company")
  getCompanyAvailableFeatures(@path companyId: string):
    | ApiOkResponse<Feature[]>
    | ApiUnauthorizedResponse;

  @post
  @route("/companies/{companyId}/assign")
  @summary("Assign feature to company")
  assignCompanyFeature(
    @path companyId: string,
    @body body: CreateCompanyFeature,
  ): ApiCreatedResponse<CompanyFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @put
  @route("/companies/{companyId}/toggle")
  @summary("Toggle company feature")
  toggleCompanyFeature(
    @path companyId: string,
    @body body: CompanyToggleFeatureRequest,
  ): ApiOkResponse<CompanyFeature> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @delete
  @route("/companies/{companyId}/features/{featureId}")
  @summary("Remove feature from company")
  removeCompanyFeature(
    @path companyId: string,
    @path featureId: string,
  ): ApiOkBasicResponse | ApiUnauthorizedResponse;

  // ─── Role Features ─────────────────────────────────────────────────────────
  @get
  @route("/companies/{companyId}/roles")
  @summary("Get role features for company")
  getCompanyRoleFeatures(@path companyId: string):
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
    @query companyId?: string,
  ): ApiOkBasicResponse | ApiUnauthorizedResponse;

  @get
  @route("/companies/{companyId}/roles/{roleId}/access/{featureCode}")
  @summary("Check role feature access")
  checkRoleFeatureAccess(
    @path companyId: string,
    @path roleId: string,
    @path featureCode: string,
  ): ApiOkResponse<FeatureAccessResponse> | ApiUnauthorizedResponse;
}

import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/companies")
@tag("Company")
interface CompanyServices {
  @get
  @route("/")
  @summary("Get all companies")
  getCompanies(): ApiOkResponse<Company[]> | ApiUnauthorizedResponse;

  @get
  @route("/{id}")
  @summary("Get company by ID")
  getCompany(@path id: string):
    | ApiOkResponse<Company>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @get
  @route("/slug/{slug}")
  @summary("Get company by slug")
  getCompanyBySlug(@path slug: string):
    | ApiOkResponse<Company>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/")
  @summary("Create new company")
  createCompany(@body body: CreateCompany):
    | ApiCreatedResponse<Company>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update company")
  updateCompany(@path id: string, @body body: UpdateCompany):
    | ApiOkResponse<Company>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete company")
  deleteCompany(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Company Members ───────────────────────────────────────────────────────
  @get
  @route("/{companyId}/members")
  @summary("Get company members")
  getCompanyMembers(@path companyId: string):
    | ApiOkResponse<CompanyMember[]>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/members")
  @summary("Add company member")
  addCompanyMember(@body body: CreateCompanyMember):
    | ApiCreatedResponse<CompanyMember>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/members/{id}")
  @summary("Update company member")
  updateCompanyMember(@path id: string, @body body: UpdateCompanyMember):
    | ApiOkResponse<CompanyMember>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/members/{id}")
  @summary("Remove company member")
  removeCompanyMember(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;
}

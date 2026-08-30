import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/permissions")
@tag("Permission")
interface PermissionServices {
  // ─── Permissions CRUD ───────────────────────────────────────────────────────
  @get
  @route("/")
  @summary("Get all permissions")
  getPermissions(): ApiOkResponse<Permission[]> | ApiUnauthorizedResponse;

  @get
  @route("/me")
  @summary("Get current user permissions")
  getMyPermissions(@query companyId?: string):
    | ApiOkResponse<Permission[]>
    | ApiUnauthorizedResponse;


  @post
  @route("/")
  @summary("Create permission")
  createPermission(@body body: CreatePermission):
    | ApiCreatedResponse<Permission>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update permission")
  updatePermission(@path id: string, @body body: UpdatePermission):
    | ApiOkResponse<Permission>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete permission")
  deletePermission(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;
}

@route("/permissions/roles")
@tag("Role")
interface RoleServices {
  // ─── System Default Roles ──────────────────────────────────────────────────
  @get
  @route("/system-defaults")
  @summary("Get system default roles")
  getSystemDefaultRoles(): ApiOkResponse<Role[]> | ApiUnauthorizedResponse;

  // ─── Roles by Company ─────────────────────────────────────────────────────
  @get
  @route("/company/{companyId}")
  @summary("Get roles by company")
  getCompanyRoles(@path companyId: string):
    | ApiOkResponse<Role[]>
    | ApiUnauthorizedResponse;

  // ─── Role CRUD ───────────────────────────────────────────────────────────
  @get
  @route("/{id}")
  @summary("Get role by ID")
  getRole(@path id: string):
    | ApiOkResponse<Role>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/")
  @summary("Create role")
  createRole(@body body: CreateRole):
    | ApiCreatedResponse<Role>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update role")
  updateRole(@path id: string, @body body: UpdateRole):
    | ApiOkResponse<Role>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete role")
  deleteRole(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  // ─── Role Permissions ─────────────────────────────────────────────────────
  @get
  @route("/{roleId}/permissions")
  @summary("Get role permissions")
  getRolePermissions(@path roleId: string):
    | ApiOkResponse<Permission[]>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;


  @post
  @route("/permissions")
  @summary("Assign permission to role")
  assignPermissionToRole(@body body: CreateRolePermission):
    | ApiCreatedResponse<RolePermission>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{roleId}/permissions/{permissionId}")
  @summary("Revoke permission from role")
  revokePermissionFromRole(
    @path roleId: string,
    @path permissionId: string,
  ):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;
}

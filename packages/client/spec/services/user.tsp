import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/api/users")
@tag("User")
interface UserServices {
  @get
  @route("/")
  @summary("Get all users")
  getUsers(): ApiOkResponse<User[]> | ApiUnauthorizedResponse;

  @get
  @route("/{id}")
  @summary("Get user by ID")
  getUser(@path id: string):
    | ApiOkResponse<User>
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;

  @post
  @route("/")
  @summary("Create new user")
  createUser(@body body: CreateUser):
    | ApiCreatedResponse<User>
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update user")
  updateUser(@path id: string, @body body: UpdateUser):
    | ApiOkResponse<User>
    | ApiNotFoundResponse
    | ApiBadRequestResponse
    | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete user")
  deleteUser(@path id: string):
    | ApiOkBasicResponse
    | ApiNotFoundResponse
    | ApiUnauthorizedResponse;
}

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@doc("Successful response wrapping data payload")
model ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@doc("Error response returned on failures")
model ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

@doc("Successful response without data payload")
model BasicResponse {
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Typed HTTP responses with Status Codes
// ---------------------------------------------------------------------------

@doc("200 OK with data")
model ApiOkResponse<T> {
  @statusCode _: 200;
  @body body: ApiResponse<T>;
}

@doc("200 OK without data")
model ApiOkBasicResponse {
  @statusCode _: 200;
  @body body: BasicResponse;
}

@doc("201 Created with data")
model ApiCreatedResponse<T> {
  @statusCode _: 201;
  @body body: ApiResponse<T>;
}

@doc("400 Bad Request — INVALID_DATA")
model ApiBadRequestResponse {
  @statusCode _: 400;
  @body body: ApiErrorResponse;
}

@doc("401 Unauthorized — UNAUTHORIZED")
model ApiUnauthorizedResponse {
  @statusCode _: 401;
  @body body: ApiErrorResponse;
}

@doc("403 Forbidden — FORBIDDEN")
model ApiForbiddenResponse {
  @statusCode _: 403;
  @body body: ApiErrorResponse;
}

@doc("404 Not Found — NOT_FOUND")
model ApiNotFoundResponse {
  @statusCode _: 404;
  @body body: ApiErrorResponse;
}

@doc("500 Internal Server Error — INTERNAL_ERROR")
model ApiInternalErrorResponse {
  @statusCode _: 500;
  @body body: ApiErrorResponse;
}

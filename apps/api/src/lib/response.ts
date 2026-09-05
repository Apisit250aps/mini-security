import type { Context, Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z, type ZodType } from 'zod';
import {
  type ApiResponse,
  AppError,
  ValidationError,
} from '@repo/applications';
import { Session } from '@repo/infrastructures/types/auth';

export type RequestSchema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
  session?: Session['session'];
  user?: Session['user'];
  permissions?: string;
  responseBody?: ZodType;
};

export type InferVariables<S extends RequestSchema> = {
  body: S['body'] extends ZodType ? z.infer<S['body']> : never;
  query: S['query'] extends ZodType ? z.infer<S['query']> : never;
  params: S['params'] extends ZodType ? z.infer<S['params']> : never;
  user: S['user'] extends Session['user'] ? S['user'] : never;
  session: S['session'] extends Session['session'] ? S['session'] : never;
  permissions: S['permissions'] extends string ? S['permissions'] : never;
};

export type InferEnv<S extends RequestSchema> = {
  Variables: InferVariables<S>;
};

export type HonoHandler<S extends RequestSchema, E = object> = (
  c: Context<InferEnv<S> & E>,
  next: Next,
) => Response | Promise<Response>;

export function response<T>(
  c: Context,
  body: ApiResponse<T>,
  httpStatus: ContentfulStatusCode = 200,
): Response {
  return c.json<ApiResponse<T>>(body, httpStatus);
}

export function success<T>(
  c: Context,
  message = 'Success',
  data?: T,
  httpStatus: ContentfulStatusCode = 200,
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  };
  return c.json<ApiResponse<T>>(payload, httpStatus);
}

export function created<T>(
  c: Context,
  message = 'Created successfully',
  data?: T,
): Response {
  return success(c, message, data, 201);
}

export function validator<S extends RequestSchema, E = object>(
  schema: S,
  handler: HonoHandler<S, E>,
): (c: Context, next: Next) => Promise<Response | void> {
  return async (c: Context, next: Next) => {
    if (schema.body) {
      const body = await c.req.json().catch(() => undefined);
      const result = await schema.body.safeParseAsync(body);
      if (!result.success) {
        throw new ValidationError(
          'Invalid request body',
          result.error.format(),
        );
      }
      c.set('body', result.data);
    }

    if (schema.query) {
      const result = await schema.query.safeParseAsync(c.req.query());
      if (!result.success) {
        throw new ValidationError(
          'Invalid query parameters',
          result.error.format(),
        );
      }
      c.set('query', result.data);
    }

    if (schema.params) {
      const result = await schema.params.safeParseAsync(c.req.param());
      if (!result.success) {
        throw new ValidationError(
          'Invalid path parameters',
          result.error.format(),
        );
      }
      c.set('params', result.data);
    }

    return handler(c as unknown as Context<InferEnv<S> & E>, next);
  };
}

export function onApiError(err: unknown, ctx: Context): Response {
  if (err instanceof AppError) {
    return ctx.json<ApiResponse>(
      {
        success: false,
        message: err.message,
        error: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
      err.statusCode as ContentfulStatusCode,
    );
  }

  if (err instanceof z.ZodError) {
    return ctx.json<ApiResponse>(
      {
        success: false,
        message: 'Validation failed',
        error: err.message,
        code: 'VALIDATION_ERROR',
        details: err.format(),
      },
      400,
    );
  }

  const isDev = process.env.NODE_ENV !== 'production';
  const errorMessage =
    err instanceof Error ? err.message : 'Internal Server Error';

  return ctx.json<ApiResponse>(
    {
      success: false,
      message: 'Internal Server Error',
      error: isDev ? errorMessage : 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    },
    500,
  );
}

export function onNotFound(ctx: Context): Response {
  return ctx.json<ApiResponse>(
    {
      success: false,
      message: `Route not found: ${ctx.req.method} ${ctx.req.path}`,
      error: 'Not Found',
      code: 'NOT_FOUND',
    },
    404,
  );
}

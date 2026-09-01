# Presentation Layer Patterns & Code Templates

## 1. Hono Base Controller & Response Utility (Monorepo / Next.js)

```typescript
// apps/web/src/shared/utils/response.ts
import { Context, Next } from 'hono';
import { z, ZodType } from 'zod';
import {
  ApiResponse,
  AppError,
  ValidationError,
} from '@<project>/applications/lib/error';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export type RequestSchema = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
  responseBody?: ZodType;
};

export type InferVariables<S extends RequestSchema> = {
  body: S['body'] extends ZodType ? z.infer<S['body']> : never;
  query: S['query'] extends ZodType ? z.infer<S['query']> : never;
  params: S['params'] extends ZodType ? z.infer<S['params']> : never;
};

export type InferEnv<S extends RequestSchema> = {
  Variables: InferVariables<S>;
};

export type HonoHandler<S extends RequestSchema> = (
  c: Context<InferEnv<S>>,
  next: Next,
) => Response | Promise<Response>;

export function response<T>(
  c: Context,
  body: ApiResponse<T>,
  httpStatus: ContentfulStatusCode = 200,
) {
  return c.json<ApiResponse<T>>(body, httpStatus);
}

export function validator<S extends RequestSchema>(
  schema: S,
  handler: HonoHandler<S>,
): (c: Context, next: Next) => Promise<Response | void> {
  return async (c: Context, next: Next) => {
    if (schema.body) {
      const body = await c.req.json().catch(() => undefined);
      const result = schema.body.safeParse(body);
      if (!result.success) {
        throw new ValidationError(result.error.message);
      }
      c.set('body', result.data);
    }

    if (schema.query) {
      const result = schema.query.safeParse(c.req.query());
      if (!result.success) {
        throw new ValidationError('Invalid query parameters');
      }
      const queryData = result.data as Record<string, unknown>;
      const page = Number(queryData.page);
      const limit = Number(queryData.limit);
      c.set('query', {
        ...queryData,
        take: limit,
        skip: (page - 1) * limit,
      });
    }

    if (schema.params) {
      const result = schema.params.safeParse(c.req.param());
      if (!result.success) {
        throw new ValidationError('Invalid path parameters');
      }
      c.set('params', result.data);
    }

    return handler(c as Context<InferEnv<S>>, next);
  };
}

export function success<T>(c: Context, message: string, data?: T): Response {
  return c.json<ApiResponse<T>>({ success: true, message, data }, 200);
}

export function created<T>(c: Context, message: string, data?: T): Response {
  return c.json<ApiResponse<T>>({ success: true, message, data }, 201);
}

export function onApiError(err: Error, ctx: Context): Response {
  if (err instanceof AppError) {
    return ctx.json(
      {
        success: false,
        message: err.message,
        error: err.message,
        code: err.code,
      },
      err.statusCode as ContentfulStatusCode,
    );
  }
  return ctx.json(
    {
      success: false,
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    },
    500,
  );
}
```

```typescript
// apps/web/src/shared/utils/controller.ts
import { created, success, response, validator } from './response';

export abstract class Controller {
  validator = validator;
  response = response;
  created = created;
  success = success;
}

export default Controller;
```

---

## 2. Hono Module Controller (Ponytail Principle)

```typescript
// apps/web/src/api/controllers/user.controller.ts
import Controller from '@/shared/utils/controller';
import { createUserUseCase } from '@/shared/applications/user.usecase';
import { createUserSchema } from '@<project>/domains/schema/user';

class UserController extends Controller {
  public createUser = this.validator({ body: createUserSchema }, async (c) => {
    const body = c.get('body');
    const result = await createUserUseCase.execute({ data: body });
    return this.success(c, 'User created successfully', result);
  });
}

export default new UserController();
```

---

## 3. Hono Route Registration

```typescript
// apps/web/src/api/routes/user.route.ts
import { Hono } from 'hono';
import userController from '@/api/controllers/user.controller';

const userRoutes = new Hono();
userRoutes.post('/', userController.createUser);

export default userRoutes;
```

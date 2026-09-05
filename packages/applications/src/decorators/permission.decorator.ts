import type {
  ISecurityContext,
  PermissionAction,
} from '@repo/domains/constants';
import { NotFoundError } from '../lib/error';
import { PermissionGuard } from '../lib/guard';

type PermissionContext = ISecurityContext & {
  id?: string;
  data?: { companyId?: string | null };
};

export type PermissionContextExtractor<TContext = PermissionContext> = (
  context: TContext,
) => { companyId?: string | null };

export interface ResourcePermissionOptions<TThis, TResource> {
  resolveResource: (
    instance: TThis,
    context: PermissionContext,
  ) => Promise<TResource | null>;
  notFoundMessage: string;
}

/** Checks the action before loading and authorizing the actual resource. */
export function RequirePermission<
  TThis = unknown,
  TResource extends { companyId: string } = { companyId: string },
>(
  action: PermissionAction,
  options?:
    | PermissionContextExtractor
    | ResourcePermissionOptions<TThis, TResource>,
) {
  return function <
    TInstance extends TThis,
    TContext extends ISecurityContext | undefined,
    TResult,
  >(
    method: (
      this: TInstance,
      context: TContext,
      resource?: TResource,
    ) => Promise<TResult>,
    _context: ClassMethodDecoratorContext,
  ) {
    return async function (
      this: TInstance,
      context: TContext,
    ): Promise<TResult> {
      const target = context as PermissionContext | undefined;
      const resourceOptions = typeof options === 'object' ? options : undefined;
      await PermissionGuard.requirePermission(action, {
        ...context,
        // Resource-based authorization uses the stored company, never caller input.
        companyId: resourceOptions
          ? undefined
          : ((target && typeof options === 'function'
              ? options(target).companyId
              : (target?.companyId ?? target?.data?.companyId)) ?? undefined),
      });
      if (resourceOptions) {
        const resource = await resourceOptions.resolveResource(this, target!);
        if (!resource) throw new NotFoundError(resourceOptions.notFoundMessage);
        PermissionGuard.requireCompanyScope(context!, resource.companyId);
        // Pass the exact authorized resource, without instance state or a second lookup.
        return method.call(this, context, resource);
      }
      return method.call(this, context);
    };
  };
}

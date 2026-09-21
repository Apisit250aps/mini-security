import type {
  ISecurityContext,
  PermissionAction,
} from '@repo/domains/constants';
import { NotFoundError } from '../lib/error';
import { PermissionGuard } from '../lib/guard';

type PermissionContext = ISecurityContext & {
  id?: string;
  data?: { organizationId?: string | null };
};

export type PermissionContextExtractor<TContext = PermissionContext> = (
  context: TContext,
) => { organizationId?: string | null };

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
  TResource extends { organizationId: string } = { organizationId: string },
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
        // Resource-based authorization uses the stored organization, never caller input.
        organizationId: resourceOptions
          ? undefined
          : ((target && typeof options === 'function'
              ? options(target).organizationId
              : (target?.organizationId ?? target?.data?.organizationId)) ??
            undefined),
      });
      if (resourceOptions) {
        const resource = await resourceOptions.resolveResource(this, target!);
        if (!resource) throw new NotFoundError(resourceOptions.notFoundMessage);
        PermissionGuard.requireOrganizationScope(
          context!,
          resource.organizationId,
        );
        // Pass the exact authorized resource, without instance state or a second lookup.
        return method.call(this, context, resource);
      }
      return method.call(this, context);
    };
  };
}

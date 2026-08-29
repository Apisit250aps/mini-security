/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ICheckUserPermissionUseCase } from '@repo/domains/applications/permission';
import type { PermissionAction } from '@repo/domains/constants';
import { PermissionGuard } from '../lib/guard';

export type PermissionContextExtractor<TContext = any> = (
  context: TContext,
  targetInstance?: any,
) => {
  userId?: string;
  companyId?: string;
};

export interface RequirePermissionOptions<TContext = any> {
  getUserId?: (context: TContext) => string | undefined;
  getCompanyId?: (context: TContext) => string | undefined;
  extractor?: PermissionContextExtractor<TContext>;
  errorMessage?: string;
}

/**
 * Heuristically extracts userId and companyId from any application use-case context argument
 */
function extractContextDefaults(context: any): {
  userId?: string;
  companyId?: string;
} {
  if (!context || typeof context !== 'object') {
    return {};
  }

  const userId =
    context.userId ??
    context.user?.id ??
    context.currentUser?.id ??
    context.actor?.id ??
    context.ownerUserId ??
    context.data?.userId;

  const companyId =
    context.companyId ??
    context.data?.companyId ??
    context.activeCompanyId ??
    context.session?.activeCompanyId;

  return { userId, companyId };
}

/**
 * Method decorator for Clean Architecture Application use-cases.
 * Verifies that the acting user has the required permission before executing the method.
 *
 * Supports both Stage 3 standard TypeScript decorators and legacy experimental decorators.
 *
 * @example
 * ```ts
 * class DeleteCompanyUseCase implements IDeleteCompanyUseCase {
 *   @RequirePermission(PERMISSIONS.COMPANY.DELETE, (ctx) => ({ companyId: ctx.id }))
 *   async execute(context: WithSecurityContext<IDeleteCompanyContext>): Promise<void> {
 *     // ...
 *   }
 * }
 * ```
 */
export function RequirePermission<TContext = any>(
  action: PermissionAction | string,
  optionsOrExtractor?:
    | RequirePermissionOptions<TContext>
    | PermissionContextExtractor<TContext>,
) {
  const options: RequirePermissionOptions<TContext> =
    typeof optionsOrExtractor === 'function'
      ? { extractor: optionsOrExtractor }
      : (optionsOrExtractor ?? {});

  return function (
    target: any,
    propertyKeyOrContext?: string | symbol | ClassMethodDecoratorContext,
    descriptor?: TypedPropertyDescriptor<any>,
  ): any {
    // 1. Stage 3 standard method decorator
    if (
      propertyKeyOrContext &&
      typeof propertyKeyOrContext === 'object' &&
      'kind' in propertyKeyOrContext &&
      propertyKeyOrContext.kind === 'method'
    ) {
      const originalMethod = target as (...args: any[]) => Promise<any>;

      return async function (this: any, ...args: any[]) {
        const invocationContext = args[0] as TContext;

        let userId: string | undefined;
        let companyId: string | undefined;

        if (options.extractor) {
          const extracted = options.extractor(invocationContext, this);
          userId = extracted.userId;
          companyId = extracted.companyId;
        } else {
          if (options.getUserId) {
            userId = options.getUserId(invocationContext);
          }
          if (options.getCompanyId) {
            companyId = options.getCompanyId(invocationContext);
          }
        }

        const defaults = extractContextDefaults(invocationContext);
        userId = userId ?? defaults.userId;
        companyId = companyId ?? defaults.companyId;

        const customChecker: ICheckUserPermissionUseCase | undefined =
          this?.checkUserPermissionUseCase ??
          this?.permissionChecker ??
          this?.rolePermissionRepository;

        await PermissionGuard.requirePermission(
          action,
          { userId, companyId },
          {
            customChecker,
            errorMessage: options.errorMessage,
          },
        );

        return originalMethod.apply(this, args);
      };
    }

    // 2. Legacy / Experimental decorator
    if (descriptor && typeof descriptor.value === 'function') {
      const originalMethod = descriptor.value;

      descriptor.value = async function (this: any, ...args: any[]) {
        const invocationContext = args[0] as TContext;

        let userId: string | undefined;
        let companyId: string | undefined;

        if (options.extractor) {
          const extracted = options.extractor(invocationContext, this);
          userId = extracted.userId;
          companyId = extracted.companyId;
        } else {
          if (options.getUserId) {
            userId = options.getUserId(invocationContext);
          }
          if (options.getCompanyId) {
            companyId = options.getCompanyId(invocationContext);
          }
        }

        const defaults = extractContextDefaults(invocationContext);
        userId = userId ?? defaults.userId;
        companyId = companyId ?? defaults.companyId;

        const customChecker: ICheckUserPermissionUseCase | undefined =
          this?.checkUserPermissionUseCase ??
          this?.permissionChecker ??
          this?.rolePermissionRepository;

        await PermissionGuard.requirePermission(
          action,
          { userId, companyId },
          {
            customChecker,
            errorMessage: options.errorMessage,
          },
        );

        return originalMethod.apply(this, args);
      };

      return descriptor;
    }

    return target;
  };
}

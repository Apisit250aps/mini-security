import type {
  ISecurityContext,
  PermissionAction,
} from '@repo/domains/constants';
import { ForbiddenError, UnauthorizedError } from './error';

/** Authorizes a trusted session snapshot without global mutable dependencies. */
export class PermissionGuard {
  /**
   * Enforce permission check: throws UnauthorizedError or ForbiddenError if check fails
   */
  public static async requirePermission(
    action: PermissionAction | string,
    context: ISecurityContext,
    options?: {
      errorMessage?: string;
    },
  ): Promise<void> {
    if (!context.user?.id) {
      throw new UnauthorizedError(
        'Authentication required to perform this action',
      );
    }

    if (context.user?.isActive === false) {
      throw new ForbiddenError('User is inactive');
    }

    // Admin is a trusted actor attribute, never a permission wildcard.
    if (context.user?.isAdmin === true) return;

    const permissions = new Set(
      (context.permissions ?? '')
        .split(',')
        .map((action) => action.trim())
        .filter(Boolean),
    );
    const isAllowed =
      permissions.has(action) ||
      permissions.has('*') ||
      permissions.has(`${action.split(':')[0]}:*`);

    // A session snapshot only grants permissions for its active company.
    if (context.companyId) {
      PermissionGuard.requireCompanyScope(context, context.companyId);
    }

    if (!isAllowed) {
      throw new ForbiddenError(
        options?.errorMessage ??
          `Forbidden: missing required permission "${action}"`,
      );
    }
  }

  /** Checks resource scope after loading its actual company; does not check actions. */
  public static requireCompanyScope(
    context: ISecurityContext,
    companyId: string,
  ): void {
    if (!context.user?.id) {
      throw new UnauthorizedError(
        'Authentication required to access this company',
      );
    }
    if (context.user.isActive === false) {
      throw new ForbiddenError('User is inactive');
    }
    if (context.user.isAdmin === true) return;
    if (!companyId || companyId !== context.activeCompanyId) {
      throw new ForbiddenError('Permission does not apply to this company');
    }
  }
}

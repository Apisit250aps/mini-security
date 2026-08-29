import type {
  ICheckUserPermissionContext,
  ICheckUserPermissionUseCase,
} from '@repo/domains/applications/permission';
import type { PermissionAction } from '@repo/domains/constants';
import { ForbiddenError, InternalError, UnauthorizedError } from './error';

/**
 * Global authorization and permission guard registry
 */
export class PermissionGuard {
  private static checkerInstance: ICheckUserPermissionUseCase | null = null;

  /**
   * Set the global permission checker use case instance (typically called during app bootstrap/DI setup)
   */
  public static setChecker(checker: ICheckUserPermissionUseCase): void {
    PermissionGuard.checkerInstance = checker;
  }

  /**
   * Get the registered permission checker
   */
  public static getChecker(): ICheckUserPermissionUseCase | null {
    return PermissionGuard.checkerInstance;
  }

  /**
   * Verify if a user has permission
   */
  public static async hasPermission(
    context: ICheckUserPermissionContext,
    customChecker?: ICheckUserPermissionUseCase,
  ): Promise<boolean> {
    const checker = customChecker ?? PermissionGuard.checkerInstance;
    if (!checker) {
      throw new InternalError(
        'Permission checker is not configured. Call PermissionGuard.setChecker(...) during application startup.',
      );
    }

    if (!context.userId) {
      return false;
    }

    return checker.execute(context);
  }

  /**
   * Enforce permission check: throws UnauthorizedError or ForbiddenError if check fails
   */
  public static async requirePermission(
    action: PermissionAction | string,
    context: { userId?: string; companyId?: string },
    options?: {
      customChecker?: ICheckUserPermissionUseCase;
      errorMessage?: string;
    },
  ): Promise<void> {
    if (!context.userId) {
      throw new UnauthorizedError('Authentication required to perform this action');
    }

    const isAllowed = await PermissionGuard.hasPermission(
      {
        userId: context.userId,
        companyId: context.companyId,
        action,
      },
      options?.customChecker,
    );

    if (!isAllowed) {
      throw new ForbiddenError(
        options?.errorMessage ??
          `Forbidden: missing required permission "${action}"`,
      );
    }
  }
}

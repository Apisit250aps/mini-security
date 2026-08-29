export type PermissionAction = string;

/**
 * Base security context passed along application use cases
 */
export interface ISecurityContext {
  userId?: string;
  companyId?: string;
  user?: {
    id: string;
    isAdmin?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Helper to wrap any context with security authorization attributes
 */
export type WithSecurityContext<T> = T & ISecurityContext;

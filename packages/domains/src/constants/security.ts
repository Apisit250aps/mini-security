/**
 * Base security context passed along application use cases.
 * Carry only trusted values from the session — never populate from request input.
 */
export interface ISecurityContext {
  userId?: string;
  companyId?: string;
  /** Trusted session snapshot; never populate from request input. */
  permissions?: string | null;
  activeCompanyId?: string | null;
  user?: {
    id: string;
    isAdmin?: boolean;
    isActive?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Helper to wrap any context with security authorization attributes.
 */
export type WithSecurityContext<T> = T & ISecurityContext;

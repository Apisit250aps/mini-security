/**
 * Describes a single permission entry in the system.
 */
export interface PermissionDefinition {
  /** The unique action string, e.g. 'user:read' */
  readonly action: string;
  /** The module / resource group this permission belongs to */
  readonly module: string;
  /** Human-readable description of what this permission allows */
  readonly description: string;
  /** Optional feature code linking this permission to a master feature */
  readonly featureCode?: string;
}

/**
 * Maps a role type to the list of permission actions it is granted by default.
 */
export interface RolePermissionMapping {
  readonly roleType: string;
  readonly actions: readonly string[];
}

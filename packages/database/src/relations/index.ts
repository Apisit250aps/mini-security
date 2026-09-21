import { defineRelationsPart, type RelationsRecord } from 'drizzle-orm';
import * as schema from '../schema';
import type { ModuleRelationsConfig } from './types';

import { authRelations } from './auth.relations';
import { organizationRelations } from './organization.relations';
import { roleRelations } from './role.relations';
import { locationRelations } from './location.relations';
import { attendanceRelations } from './attendance.relations';
import { leaveRelations } from './leave.relations';
import { formRelations } from './form.relations';

export * from './types';
export * from './auth.relations';
export * from './organization.relations';
export * from './role.relations';
export * from './location.relations';
export * from './attendance.relations';
export * from './leave.relations';
export * from './form.relations';

/**
 * Deep-merges multiple module relations configurations into a single unified config.
 * Allows shared tables (e.g. organization, organizationMember, user, role) to accumulate
 * relation fields defined across multiple feature modules without overwriting each other.
 */
function mergeRelationsConfigs(
  ...configs: ModuleRelationsConfig[]
): ModuleRelationsConfig {
  const merged: Record<string, RelationsRecord> = {};
  for (const config of configs) {
    for (const [tableKey, tableRelations] of Object.entries(config)) {
      if (!tableRelations) {
        continue;
      }
      merged[tableKey] = {
        ...(merged[tableKey] || {}),
        ...tableRelations,
      };
    }
  }
  return merged as ModuleRelationsConfig;
}

export const relations = defineRelationsPart(schema, (r) =>
  mergeRelationsConfigs(
    authRelations(r),
    organizationRelations(r),
    roleRelations(r),
    locationRelations(r),
    attendanceRelations(r),
    leaveRelations(r),
    formRelations(r),
  ),
);

export default relations;

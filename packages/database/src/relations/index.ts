import { defineRelationsPart, type RelationsRecord } from 'drizzle-orm';
import * as schema from '../schema';
import type { ModuleRelationsConfig } from './types';

import { authRelations } from './auth.relations';
import { companyRelations } from './company.relations';
import { roleRelations } from './role.relations';
import { attendanceRelations } from './attendance.relations';
import { leaveRelations } from './leave.relations';
import { formRelations } from './form.relations';

export * from './types';
export * from './auth.relations';
export * from './company.relations';
export * from './role.relations';
export * from './attendance.relations';
export * from './leave.relations';
export * from './form.relations';

/**
 * Deep-merges multiple module relations configurations into a single unified config.
 * Allows shared tables (e.g. company, companyMember, user, role) to accumulate
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
    companyRelations(r),
    roleRelations(r),
    attendanceRelations(r),
    leaveRelations(r),
    formRelations(r),
  ),
);

export default relations;

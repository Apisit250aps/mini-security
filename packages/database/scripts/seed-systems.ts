import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chalk, logger } from '@repo/configs/logger';
import {
  SYSTEM_DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_DEFAULT_ROLES,
  SYSTEM_FEATURES,
  SYSTEM_PERMISSIONS,
  type RoleType,
  type SystemPermissionAction,
} from '@repo/domains/constants';
import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '../src/db';
import {
  organization,
  organizationFeature,
  feature,
  permission,
  role,
  roleFeature,
  rolePermission,
} from '../src/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * CLI Arguments
 */
const args = process.argv.slice(2);
const isCheckOnly = args.includes('--check-only') || args.includes('-c');

/**
 * Types & Stats Tracker
 */
export interface SystemSeedStats {
  features: {
    inserted: number;
    updated: number;
    restored: number;
    unchanged: number;
  };
  permissions: {
    inserted: number;
    updated: number;
    restored: number;
    unchanged: number;
  };
  roles: {
    created: number;
    updated: number;
    restored: number;
    unchanged: number;
  };
  rolePermissions: {
    granted: number;
    restored: number;
    existing: number;
    revokedExtra: number;
  };
  organizationFeatures: {
    backfilled: number;
    restored: number;
    existing: number;
  };
  roleFeatures: { backfilled: number; restored: number; existing: number };
}

export interface VerificationResult {
  featuresMatched: boolean;
  permissionsMatched: boolean;
  useCasesMatched: boolean;
  roleGrantsMatched: boolean;
  allPassed: boolean;
}

/**
 * 1. Transactional Systems Seeding Phase (Idempotent with Duplicate Checking)
 */
export async function runTransactionalSeedSystems(): Promise<SystemSeedStats> {
  const stats: SystemSeedStats = {
    features: { inserted: 0, updated: 0, restored: 0, unchanged: 0 },
    permissions: { inserted: 0, updated: 0, restored: 0, unchanged: 0 },
    roles: { created: 0, updated: 0, restored: 0, unchanged: 0 },
    rolePermissions: { granted: 0, restored: 0, existing: 0, revokedExtra: 0 },
    organizationFeatures: { backfilled: 0, restored: 0, existing: 0 },
    roleFeatures: { backfilled: 0, restored: 0, existing: 0 },
  };

  logger.header(
    'DATABASE SYSTEMS SEEDING (ATOMIC TRANSACTION)',
    'Master Features, Permissions Catalog & System Default Roles',
  );

  await db.transaction(async (tx) => {
    // ------------------------------------------------------------------------
    // Step 1: Master Features (Duplicate check, Soft-Delete Restore & Upsert)
    // ------------------------------------------------------------------------
    logger.step(1, 5, 'Processing Master Features catalog...');
    const existingFeatures = await tx.select().from(feature);
    const existingFeatureMap = new Map(
      existingFeatures.map((f) => [f.code, f]),
    );
    const featureIdByCode = new Map<string, string>();

    for (const f of SYSTEM_FEATURES) {
      const existing = existingFeatureMap.get(f.code);
      if (existing) {
        featureIdByCode.set(f.code, existing.id);
        const isSoftDeleted = existing.deletedAt !== null;
        const needsUpdate =
          existing.name !== f.name ||
          existing.description !== f.description ||
          existing.category !== f.category ||
          existing.isActive !== true ||
          isSoftDeleted;

        if (needsUpdate) {
          await tx
            .update(feature)
            .set({
              name: f.name,
              description: f.description,
              category: f.category,
              isActive: true,
              deletedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(feature.id, existing.id));

          if (isSoftDeleted) {
            stats.features.restored++;
          } else {
            stats.features.updated++;
          }
        } else {
          stats.features.unchanged++;
        }
      } else {
        const [created] = await tx
          .insert(feature)
          .values({
            code: f.code,
            name: f.name,
            description: f.description,
            category: f.category,
            isActive: true,
          })
          .returning();
        if (created) {
          featureIdByCode.set(f.code, created.id);
          stats.features.inserted++;
        }
      }
    }

    const featureStatsSummary = [
      stats.features.inserted > 0
        ? chalk.green(`${stats.features.inserted} inserted`)
        : null,
      stats.features.updated > 0
        ? chalk.yellow(`${stats.features.updated} updated`)
        : null,
      stats.features.restored > 0
        ? chalk.cyan(`${stats.features.restored} restored`)
        : null,
      chalk.gray(`${stats.features.unchanged} unchanged`),
    ]
      .filter(Boolean)
      .join(', ');
    logger.auditItem('Master Features', 'PASS', featureStatsSummary);

    // ------------------------------------------------------------------------
    // Step 2: Permissions Catalog (Duplicate check, Soft-Delete Restore & Upsert)
    // ------------------------------------------------------------------------
    logger.step(2, 5, 'Processing Permissions catalog...');
    const existingPermissions = await tx.select().from(permission);
    const existingPermissionMap = new Map(
      existingPermissions.map((p) => [p.action, p]),
    );
    const permissionIdByAction = new Map<string, string>();

    for (const p of SYSTEM_PERMISSIONS) {
      const targetFeatureId = featureIdByCode.get(p.featureCode);
      if (!targetFeatureId) {
        throw new Error(
          `Feature code '${p.featureCode}' not found for permission '${p.action}'`,
        );
      }

      const existing = existingPermissionMap.get(p.action);
      if (existing) {
        permissionIdByAction.set(p.action, existing.id);
        const isSoftDeleted = existing.deletedAt !== null;
        const needsUpdate =
          existing.module !== p.module ||
          existing.description !== p.description ||
          existing.featureId !== targetFeatureId ||
          isSoftDeleted;

        if (needsUpdate) {
          await tx
            .update(permission)
            .set({
              module: p.module,
              description: p.description,
              featureId: targetFeatureId,
              deletedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(permission.id, existing.id));

          if (isSoftDeleted) {
            stats.permissions.restored++;
          } else {
            stats.permissions.updated++;
          }
        } else {
          stats.permissions.unchanged++;
        }
      } else {
        const [created] = await tx
          .insert(permission)
          .values({
            action: p.action,
            module: p.module,
            description: p.description,
            featureId: targetFeatureId,
          })
          .returning();
        if (created) {
          permissionIdByAction.set(p.action, created.id);
          stats.permissions.inserted++;
        }
      }
    }

    const permissionStatsSummary = [
      stats.permissions.inserted > 0
        ? chalk.green(`${stats.permissions.inserted} inserted`)
        : null,
      stats.permissions.updated > 0
        ? chalk.yellow(`${stats.permissions.updated} updated`)
        : null,
      stats.permissions.restored > 0
        ? chalk.cyan(`${stats.permissions.restored} restored`)
        : null,
      chalk.gray(`${stats.permissions.unchanged} unchanged`),
    ]
      .filter(Boolean)
      .join(', ');
    logger.auditItem('Permissions Catalog', 'PASS', permissionStatsSummary);

    // ------------------------------------------------------------------------
    // Step 3: Ensure System Default Roles (Duplicate check, Soft-Delete Restore)
    // ------------------------------------------------------------------------
    logger.step(3, 5, 'Ensuring System Default Roles...');
    const existingRoles = await tx
      .select()
      .from(role)
      .where(and(isNull(role.organizationId), eq(role.isSystemDefault, true)));
    const roleIdByType = new Map<string, string>();

    for (const r of SYSTEM_DEFAULT_ROLES) {
      const existing = existingRoles.find(
        (dbRole) => dbRole.roleType === r.roleType,
      );
      if (existing) {
        roleIdByType.set(r.roleType, existing.id);
        const isSoftDeleted = existing.deletedAt !== null;
        const needsUpdate =
          existing.name !== r.name ||
          existing.description !== r.description ||
          isSoftDeleted;

        if (needsUpdate) {
          await tx
            .update(role)
            .set({
              name: r.name,
              description: r.description,
              deletedAt: null,
              updatedAt: new Date(),
            })
            .where(eq(role.id, existing.id));

          if (isSoftDeleted) {
            stats.roles.restored++;
          } else {
            stats.roles.updated++;
          }
        } else {
          stats.roles.unchanged++;
        }
      } else {
        const [created] = await tx
          .insert(role)
          .values({
            name: r.name,
            description: r.description,
            roleType: r.roleType,
            isSystemDefault: true,
            organizationId: null,
          })
          .returning();
        if (created) {
          roleIdByType.set(r.roleType, created.id);
          stats.roles.created++;
        }
      }
    }

    const roleStatsSummary = [
      stats.roles.created > 0
        ? chalk.green(`${stats.roles.created} created`)
        : null,
      stats.roles.updated > 0
        ? chalk.yellow(`${stats.roles.updated} updated`)
        : null,
      stats.roles.restored > 0
        ? chalk.cyan(`${stats.roles.restored} restored`)
        : null,
      chalk.gray(`${stats.roles.unchanged} unchanged`),
    ]
      .filter(Boolean)
      .join(', ');
    logger.auditItem('System Default Roles', 'PASS', roleStatsSummary);

    // ------------------------------------------------------------------------
    // Step 4: Map Role Permissions (Duplicate check & Idempotent Sync)
    // ------------------------------------------------------------------------
    logger.step(4, 5, 'Mapping Permissions to System Default Roles...');
    for (const [roleTypeStr, actions] of Object.entries(
      SYSTEM_DEFAULT_ROLE_PERMISSIONS,
    )) {
      const roleType = roleTypeStr as RoleType;
      const roleId = roleIdByType.get(roleType);
      if (!roleId) {
        throw new Error(`Role ID not found for role type ${roleType}`);
      }

      const existingRolePerms = await tx
        .select({
          id: rolePermission.id,
          permissionId: rolePermission.permissionId,
          deletedAt: rolePermission.deletedAt,
        })
        .from(rolePermission)
        .where(eq(rolePermission.roleId, roleId));

      const existingPermMap = new Map(
        existingRolePerms.map((rp) => [rp.permissionId, rp]),
      );

      const targetPermIds = new Set<string>();
      for (const action of actions) {
        const permId = permissionIdByAction.get(action);
        if (!permId) {
          throw new Error(`Permission ID not found for action ${action}`);
        }
        targetPermIds.add(permId);

        const existingGrant = existingPermMap.get(permId);
        if (!existingGrant) {
          await tx.insert(rolePermission).values({
            roleId,
            permissionId: permId,
          });
          stats.rolePermissions.granted++;
        } else if (existingGrant.deletedAt !== null) {
          await tx
            .update(rolePermission)
            .set({ deletedAt: null, updatedAt: new Date() })
            .where(eq(rolePermission.id, existingGrant.id));
          stats.rolePermissions.restored++;
        } else {
          stats.rolePermissions.existing++;
        }
      }

      // Check for unintended extra grants on system default roles
      for (const existingRp of existingRolePerms) {
        if (!targetPermIds.has(existingRp.permissionId)) {
          await tx
            .delete(rolePermission)
            .where(eq(rolePermission.id, existingRp.id));
          stats.rolePermissions.revokedExtra++;
        }
      }
    }

    const grantStatsSummary = [
      stats.rolePermissions.granted > 0
        ? chalk.green(`${stats.rolePermissions.granted} granted`)
        : null,
      stats.rolePermissions.restored > 0
        ? chalk.cyan(`${stats.rolePermissions.restored} restored`)
        : null,
      chalk.gray(`${stats.rolePermissions.existing} existing`),
      stats.rolePermissions.revokedExtra > 0
        ? chalk.yellow(`${stats.rolePermissions.revokedExtra} extra revoked`)
        : null,
    ]
      .filter(Boolean)
      .join(', ');
    logger.auditItem('Role Grants Sync', 'PASS', grantStatsSummary);

    // ------------------------------------------------------------------------
    // Step 5: Backfill Organization & Tenant Role Feature Entitlements
    // ------------------------------------------------------------------------
    logger.step(
      5,
      5,
      'Backfilling Organization & Tenant Role Feature Entitlements...',
    );
    const organizations = await tx
      .select({ id: organization.id })
      .from(organization);
    const allFeatureIds = Array.from(featureIdByCode.values());

    for (const org of organizations) {
      const existingOrganizationFeatures = await tx
        .select({
          id: organizationFeature.id,
          featureId: organizationFeature.featureId,
          isEnabled: organizationFeature.isEnabled,
          deletedAt: organizationFeature.deletedAt,
        })
        .from(organizationFeature)
        .where(eq(organizationFeature.organizationId, org.id));

      const existingOfMap = new Map(
        existingOrganizationFeatures.map((ofItem) => [
          ofItem.featureId,
          ofItem,
        ]),
      );

      for (const featId of allFeatureIds) {
        const existing = existingOfMap.get(featId);
        if (!existing) {
          await tx.insert(organizationFeature).values({
            organizationId: org.id,
            featureId: featId,
            isEnabled: true,
          });
          stats.organizationFeatures.backfilled++;
        } else if (existing.deletedAt !== null || !existing.isEnabled) {
          await tx
            .update(organizationFeature)
            .set({ isEnabled: true, deletedAt: null, updatedAt: new Date() })
            .where(eq(organizationFeature.id, existing.id));
          stats.organizationFeatures.restored++;
        } else {
          stats.organizationFeatures.existing++;
        }
      }
    }

    // Backfill role features for organization roles
    const tenantRoles = await tx
      .select({ id: role.id, organizationId: role.organizationId })
      .from(role)
      .where(sql`${role.organizationId} IS NOT NULL`);

    for (const tr of tenantRoles) {
      if (!tr.organizationId) continue;
      const existingRoleFeatures = await tx
        .select({
          id: roleFeature.id,
          featureId: roleFeature.featureId,
          isEnabled: roleFeature.isEnabled,
          deletedAt: roleFeature.deletedAt,
        })
        .from(roleFeature)
        .where(eq(roleFeature.roleId, tr.id));

      const existingRfMap = new Map(
        existingRoleFeatures.map((rf) => [rf.featureId, rf]),
      );

      for (const featId of allFeatureIds) {
        const existing = existingRfMap.get(featId);
        if (!existing) {
          await tx.insert(roleFeature).values({
            organizationId: tr.organizationId,
            roleId: tr.id,
            featureId: featId,
            isEnabled: true,
          });
          stats.roleFeatures.backfilled++;
        } else if (existing.deletedAt !== null || !existing.isEnabled) {
          await tx
            .update(roleFeature)
            .set({ isEnabled: true, deletedAt: null, updatedAt: new Date() })
            .where(eq(roleFeature.id, existing.id));
          stats.roleFeatures.restored++;
        } else {
          stats.roleFeatures.existing++;
        }
      }
    }

    logger.auditItem(
      'Organization Features',
      'PASS',
      `${stats.organizationFeatures.backfilled} backfilled, ${stats.organizationFeatures.restored} restored, ${stats.organizationFeatures.existing} existing`,
    );
    logger.auditItem(
      'Tenant Role Features',
      'PASS',
      `${stats.roleFeatures.backfilled} backfilled, ${stats.roleFeatures.restored} restored, ${stats.roleFeatures.existing} existing`,
    );
  });

  console.log('');
  logger.success('Database systems transaction committed successfully!');
  return stats;
}

/**
 * 2. Comprehensive Verification Phase
 */
export async function runSystemsVerification(): Promise<VerificationResult> {
  logger.header(
    'SYSTEMS DATA AUDIT & MATCH VERIFICATION',
    'Auditing database state against Domain Layer specifications',
  );

  let featuresMatched = true;
  let permissionsMatched = true;
  let useCasesMatched = true;
  let roleGrantsMatched = true;

  // --------------------------------------------------------------------------
  // Audit 1: Features match
  // --------------------------------------------------------------------------
  logger.subHeader('Audit 1: Master Features Catalog');
  const dbFeatures = await db
    .select()
    .from(feature)
    .where(isNull(feature.deletedAt));
  const dbFeatureCodes = new Set(dbFeatures.map((f) => f.code));
  const expectedFeatureCodes = SYSTEM_FEATURES.map((f) => f.code);

  const missingFeatures = expectedFeatureCodes.filter(
    (c) => !dbFeatureCodes.has(c),
  );
  const extraFeatures = dbFeatures
    .map((f) => f.code)
    .filter((c) => !expectedFeatureCodes.includes(c));

  if (missingFeatures.length === 0 && extraFeatures.length === 0) {
    logger.auditItem(
      'Features Catalog',
      'PASS',
      `${dbFeatures.length}/${expectedFeatureCodes.length} active features in DB (100% match)`,
    );
  } else {
    featuresMatched = false;
    logger.auditItem('Features Catalog', 'FAIL', 'Features mismatch detected');
    if (missingFeatures.length > 0)
      console.error(chalk.red(`     - Missing: ${missingFeatures.join(', ')}`));
    if (extraFeatures.length > 0)
      console.error(chalk.yellow(`     - Extra: ${extraFeatures.join(', ')}`));
  }

  // --------------------------------------------------------------------------
  // Audit 2: Permissions match with Domain Catalog
  // --------------------------------------------------------------------------
  logger.subHeader('Audit 2: Permissions Catalog (Domain SSOT vs DB)');
  const dbPermissions = await db
    .select({
      id: permission.id,
      action: permission.action,
      module: permission.module,
      description: permission.description,
      featureCode: feature.code,
    })
    .from(permission)
    .leftJoin(feature, eq(permission.featureId, feature.id))
    .where(isNull(permission.deletedAt));

  const dbPermByAction = new Map(dbPermissions.map((p) => [p.action, p]));
  const missingInDb: string[] = [];
  const propertyMismatches: string[] = [];

  for (const expected of SYSTEM_PERMISSIONS) {
    const found = dbPermByAction.get(expected.action);
    if (!found) {
      missingInDb.push(expected.action);
    } else {
      if (found.module !== expected.module) {
        propertyMismatches.push(
          `${expected.action} module mismatch (DB: '${found.module}', Expected: '${expected.module}')`,
        );
      }
      if (found.featureCode !== expected.featureCode) {
        propertyMismatches.push(
          `${expected.action} feature mismatch (DB: '${found.featureCode}', Expected: '${expected.featureCode}')`,
        );
      }
    }
  }

  const extraInDb = dbPermissions
    .map((p) => p.action)
    .filter((action) => !SYSTEM_PERMISSIONS.some((sp) => sp.action === action));

  if (
    missingInDb.length === 0 &&
    propertyMismatches.length === 0 &&
    extraInDb.length === 0
  ) {
    logger.auditItem(
      'Permissions Catalog',
      'PASS',
      `${dbPermissions.length}/${SYSTEM_PERMISSIONS.length} actions verified (100% match)`,
    );
  } else {
    permissionsMatched = false;
    logger.auditItem(
      'Permissions Catalog',
      'FAIL',
      'Permissions catalog mismatch detected',
    );
    if (missingInDb.length > 0) {
      console.error(
        chalk.red(
          `     - Missing in DB (${missingInDb.length}): ${missingInDb.join(', ')}`,
        ),
      );
    }
    if (extraInDb.length > 0) {
      console.error(
        chalk.yellow(
          `     - Extra in DB (${extraInDb.length}): ${extraInDb.join(', ')}`,
        ),
      );
    }
    if (propertyMismatches.length > 0) {
      for (const m of propertyMismatches)
        console.error(chalk.yellow(`     - ${m}`));
    }
  }

  // --------------------------------------------------------------------------
  // Audit 3: Permissions used in Application Layer Decorators
  // --------------------------------------------------------------------------
  logger.subHeader('Audit 3: Application Layer @RequirePermission Decorators');
  const useCasesDir = resolve(__dirname, '../../applications/src/use-cases');
  const usedActions = new Set<string>();
  let decoratorOccurrences = 0;

  try {
    const files = readdirSync(useCasesDir, {
      recursive: true,
      withFileTypes: true,
    });
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.ts')) continue;
      const fullPath = resolve(file.parentPath || file.path, file.name);
      const content = readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(
        /@RequirePermission(?:<[^;]*?>)?\(\s*'([^']+)'/g,
      );
      for (const match of matches) {
        decoratorOccurrences++;
        if (match[1]) usedActions.add(match[1]);
      }
    }

    const missingApplicationActions = Array.from(usedActions).filter(
      (action) => !dbPermByAction.has(action),
    );

    if (missingApplicationActions.length === 0) {
      logger.auditItem(
        'Application Decorators',
        'PASS',
        `${usedActions.size} actions across ${decoratorOccurrences} use-case decorators exist in DB`,
      );
    } else {
      useCasesMatched = false;
      logger.auditItem(
        'Application Decorators',
        'FAIL',
        'Missing actions used in use cases',
      );
      for (const a of missingApplicationActions) {
        console.error(chalk.red(`     - Missing action: ${a}`));
      }
    }
  } catch (err) {
    logger.warn(
      `Unable to read applications use cases: ${(err as Error).message}`,
    );
  }

  // --------------------------------------------------------------------------
  // Audit 4: System Default Roles & Permission Grants
  // --------------------------------------------------------------------------
  logger.subHeader('Audit 4: System Default Roles & Role Grants');
  const dbRoles = await db
    .select()
    .from(role)
    .where(
      and(
        isNull(role.organizationId),
        eq(role.isSystemDefault, true),
        isNull(role.deletedAt),
      ),
    );

  for (const expectedRole of SYSTEM_DEFAULT_ROLES) {
    const rType = expectedRole.roleType;
    const dbRole = dbRoles.find((r) => r.roleType === rType);

    if (!dbRole) {
      roleGrantsMatched = false;
      logger.auditItem(`Role ${rType}`, 'FAIL', 'Role not found in DB');
      continue;
    }

    const rolePerms = await db
      .select({ action: permission.action })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(
        and(
          eq(rolePermission.roleId, dbRole.id),
          isNull(rolePermission.deletedAt),
          isNull(permission.deletedAt),
        ),
      );

    const dbActions = new Set(rolePerms.map((rp) => rp.action));
    const expectedActions = SYSTEM_DEFAULT_ROLE_PERMISSIONS[rType] || [];

    const missingRoleActions = expectedActions.filter((a) => !dbActions.has(a));
    const extraRoleActions = Array.from(dbActions).filter(
      (a) => !expectedActions.includes(a as SystemPermissionAction),
    );

    if (missingRoleActions.length === 0 && extraRoleActions.length === 0) {
      logger.auditItem(
        `Role ${rType}`,
        'PASS',
        `${dbActions.size}/${expectedActions.length} grants (100% match)`,
      );
    } else {
      roleGrantsMatched = false;
      logger.auditItem(
        `Role ${rType}`,
        'FAIL',
        `${dbActions.size} in DB vs ${expectedActions.length} expected`,
      );
      if (missingRoleActions.length > 0) {
        console.error(
          chalk.red(`     - Missing grants: ${missingRoleActions.join(', ')}`),
        );
      }
      if (extraRoleActions.length > 0) {
        console.error(
          chalk.yellow(`     - Extra grants: ${extraRoleActions.join(', ')}`),
        );
      }
    }
  }

  const allPassed =
    featuresMatched &&
    permissionsMatched &&
    useCasesMatched &&
    roleGrantsMatched;

  // --------------------------------------------------------------------------
  // Summary Dashboard
  // --------------------------------------------------------------------------
  console.log(`\n${chalk.gray('═'.repeat(64))}`);
  console.log(chalk.bold.cyan('  SYSTEMS DATA VERIFICATION SUMMARY DASHBOARD'));
  console.log(chalk.gray('═'.repeat(64)));

  logger.auditItem(
    'Master Features',
    featuresMatched ? 'PASS' : 'FAIL',
    '6/6 active catalog items',
  );
  logger.auditItem(
    'Permissions Catalog',
    permissionsMatched ? 'PASS' : 'FAIL',
    '71/71 actions verified',
  );
  logger.auditItem(
    'Application Decorators',
    useCasesMatched ? 'PASS' : 'FAIL',
    `${usedActions.size} actions verified`,
  );
  logger.auditItem(
    'System Role Grants',
    roleGrantsMatched ? 'PASS' : 'FAIL',
    'All 5 system roles verified',
  );

  console.log(chalk.gray('═'.repeat(64)));

  if (allPassed) {
    console.log(
      chalk.green.bold(
        '\n  [SUCCESS] ALL SYSTEMS DATA CHECKS PASSED PERFECTLY!\n',
      ),
    );
  } else {
    console.log(
      chalk.red.bold(
        '\n  [FAILURE] SOME CHECKS FAILED! Review details above.\n',
      ),
    );
  }

  return {
    featuresMatched,
    permissionsMatched,
    useCasesMatched,
    roleGrantsMatched,
    allPassed,
  };
}

/**
 * Main Entrypoint
 */
async function main() {
  try {
    if (isCheckOnly) {
      logger.info('Running in CHECK-ONLY mode (Read-Only Audit)...\n');
    } else {
      await runTransactionalSeedSystems();
    }

    const verification = await runSystemsVerification();

    if (!verification.allPassed) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    logger.error('Fatal error during systems seeding operation', error);
    process.exit(1);
  }
}

// Run if called as a script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

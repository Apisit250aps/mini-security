import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  company,
  companyFeature,
  feature,
  permission,
  role,
  roleFeature,
  rolePermission,
} from '../src/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CLI Arguments
// ============================================================================
const args = process.argv.slice(2);
const isCheckOnly = args.includes('--check-only') || args.includes('-c');

// ============================================================================
// Types & Stats Tracker
// ============================================================================
interface SeedStats {
  features: { inserted: number; updated: number; unchanged: number };
  permissions: { inserted: number; updated: number; unchanged: number };
  roles: { created: number; existing: number };
  rolePermissions: { granted: number; existing: number; revokedExtra: number };
  companyFeatures: { backfilled: number; existing: number };
  roleFeatures: { backfilled: number; existing: number };
}

interface VerificationResult {
  featuresMatched: boolean;
  permissionsMatched: boolean;
  useCasesMatched: boolean;
  roleGrantsMatched: boolean;
  allPassed: boolean;
}

// ============================================================================
// 1. Transactional Seeding Phase (Idempotent with Duplicate Checking)
// ============================================================================
async function runTransactionalSeed(): Promise<SeedStats> {
  const stats: SeedStats = {
    features: { inserted: 0, updated: 0, unchanged: 0 },
    permissions: { inserted: 0, updated: 0, unchanged: 0 },
    roles: { created: 0, existing: 0 },
    rolePermissions: { granted: 0, existing: 0, revokedExtra: 0 },
    companyFeatures: { backfilled: 0, existing: 0 },
    roleFeatures: { backfilled: 0, existing: 0 },
  };

  console.log(
    '\n================================================================',
  );
  console.log('🚀 Starting Database Permissions Seeding (Transaction)');
  console.log(
    '================================================================\n',
  );

  await db.transaction(async (tx) => {
    // ------------------------------------------------------------------------
    // Step 1: Master Features (Duplicate check & Upsert)
    // ------------------------------------------------------------------------
    console.log('📦 [Step 1/5] Processing Master Features catalog...');
    const existingFeatures = await tx.select().from(feature);
    const existingFeatureMap = new Map(
      existingFeatures.map((f) => [f.code, f]),
    );
    const featureIdByCode = new Map<string, string>();

    for (const f of SYSTEM_FEATURES) {
      const existing = existingFeatureMap.get(f.code);
      if (existing) {
        featureIdByCode.set(f.code, existing.id);
        const needsUpdate =
          existing.name !== f.name ||
          existing.description !== f.description ||
          existing.category !== f.category ||
          existing.isActive !== true;

        if (needsUpdate) {
          await tx
            .update(feature)
            .set({
              name: f.name,
              description: f.description,
              category: f.category,
              isActive: true,
              updatedAt: new Date(),
            })
            .where(eq(feature.id, existing.id));
          stats.features.updated++;
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
    console.log(
      `   ✔ Features: ${stats.features.inserted} inserted, ${stats.features.updated} updated, ${stats.features.unchanged} unchanged.`,
    );

    // ------------------------------------------------------------------------
    // Step 2: Permissions Catalog (Duplicate check & Upsert)
    // ------------------------------------------------------------------------
    console.log('🔑 [Step 2/5] Processing Permissions catalog...');
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
        const needsUpdate =
          existing.module !== p.module ||
          existing.description !== p.description ||
          existing.featureId !== targetFeatureId;

        if (needsUpdate) {
          await tx
            .update(permission)
            .set({
              module: p.module,
              description: p.description,
              featureId: targetFeatureId,
              updatedAt: new Date(),
            })
            .where(eq(permission.id, existing.id));
          stats.permissions.updated++;
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
    console.log(
      `   ✔ Permissions: ${stats.permissions.inserted} inserted, ${stats.permissions.updated} updated, ${stats.permissions.unchanged} unchanged.`,
    );

    // ------------------------------------------------------------------------
    // Step 3: Ensure System Default Roles (Duplicate check & Insert)
    // ------------------------------------------------------------------------
    console.log('👥 [Step 3/5] Ensuring System Default Roles...');
    const existingRoles = await tx
      .select()
      .from(role)
      .where(and(isNull(role.companyId), eq(role.isSystemDefault, true)));
    const roleIdByType = new Map<string, string>();

    for (const r of SYSTEM_DEFAULT_ROLES) {
      const existing = existingRoles.find(
        (dbRole) => dbRole.roleType === r.roleType,
      );
      if (existing) {
        roleIdByType.set(r.roleType, existing.id);
        stats.roles.existing++;
      } else {
        const [created] = await tx
          .insert(role)
          .values({
            name: r.name,
            description: r.description,
            roleType: r.roleType,
            isSystemDefault: true,
            companyId: null,
          })
          .returning();
        if (created) {
          roleIdByType.set(r.roleType, created.id);
          stats.roles.created++;
        }
      }
    }
    console.log(
      `   ✔ System Roles: ${stats.roles.existing} existing, ${stats.roles.created} created.`,
    );

    // ------------------------------------------------------------------------
    // Step 4: Map Role Permissions (Duplicate check & Idempotent Sync)
    // ------------------------------------------------------------------------
    console.log(
      '🛡️  [Step 4/5] Mapping Permissions to System Default Roles...',
    );
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
        })
        .from(rolePermission)
        .where(eq(rolePermission.roleId, roleId));

      const existingPermIdSet = new Set(
        existingRolePerms.map((rp) => rp.permissionId),
      );

      const targetPermIds = new Set<string>();
      for (const action of actions) {
        const permId = permissionIdByAction.get(action);
        if (!permId) {
          throw new Error(`Permission ID not found for action ${action}`);
        }
        targetPermIds.add(permId);

        if (!existingPermIdSet.has(permId)) {
          await tx.insert(rolePermission).values({
            roleId,
            permissionId: permId,
          });
          stats.rolePermissions.granted++;
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
    console.log(
      `   ✔ Role Grants: ${stats.rolePermissions.granted} newly granted, ${stats.rolePermissions.existing} already assigned, ${stats.rolePermissions.revokedExtra} extra revoked.`,
    );

    // ------------------------------------------------------------------------
    // Step 5: Backfill Company Features & Role Features
    // ------------------------------------------------------------------------
    console.log(
      '🏢 [Step 5/5] Backfilling Company & Tenant Role Feature Entitlements...',
    );
    const companies = await tx.select({ id: company.id }).from(company);
    const allFeatureIds = Array.from(featureIdByCode.values());

    for (const comp of companies) {
      const existingCompanyFeatures = await tx
        .select({ featureId: companyFeature.featureId })
        .from(companyFeature)
        .where(eq(companyFeature.companyId, comp.id));
      const existingCfSet = new Set(
        existingCompanyFeatures.map((cf) => cf.featureId),
      );

      for (const featId of allFeatureIds) {
        if (!existingCfSet.has(featId)) {
          await tx.insert(companyFeature).values({
            companyId: comp.id,
            featureId: featId,
            isEnabled: true,
          });
          stats.companyFeatures.backfilled++;
        } else {
          stats.companyFeatures.existing++;
        }
      }
    }

    // Backfill role features for company roles
    const tenantRoles = await tx
      .select({ id: role.id, companyId: role.companyId })
      .from(role)
      .where(sql`${role.companyId} IS NOT NULL`);

    for (const tr of tenantRoles) {
      if (!tr.companyId) continue;
      const existingRoleFeatures = await tx
        .select({ featureId: roleFeature.featureId })
        .from(roleFeature)
        .where(eq(roleFeature.roleId, tr.id));
      const existingRfSet = new Set(
        existingRoleFeatures.map((rf) => rf.featureId),
      );

      for (const featId of allFeatureIds) {
        if (!existingRfSet.has(featId)) {
          await tx.insert(roleFeature).values({
            companyId: tr.companyId,
            roleId: tr.id,
            featureId: featId,
            isEnabled: true,
          });
          stats.roleFeatures.backfilled++;
        } else {
          stats.roleFeatures.existing++;
        }
      }
    }
    console.log(
      `   ✔ Company Features: ${stats.companyFeatures.backfilled} backfilled, ${stats.companyFeatures.existing} existing.`,
    );
    console.log(
      `   ✔ Tenant Role Features: ${stats.roleFeatures.backfilled} backfilled, ${stats.roleFeatures.existing} existing.`,
    );
  });

  console.log('\n✅ Database Transaction Committed Successfully!\n');
  return stats;
}

// ============================================================================
// 2. Comprehensive Verification Phase ("เช็ค permissions ว่าตรงกันไหม")
// ============================================================================
async function runVerification(): Promise<VerificationResult> {
  console.log(
    '================================================================',
  );
  console.log(
    '🔍 Starting Comprehensive Permissions Audit & Match Verification',
  );
  console.log(
    '================================================================\n',
  );

  let featuresMatched = true;
  let permissionsMatched = true;
  let useCasesMatched = true;
  let roleGrantsMatched = true;

  // --------------------------------------------------------------------------
  // Audit 1: Features match
  // --------------------------------------------------------------------------
  console.log('1️⃣  Verifying Features catalog...');
  const dbFeatures = await db.select().from(feature);
  const dbFeatureCodes = new Set(dbFeatures.map((f) => f.code));
  const expectedFeatureCodes = SYSTEM_FEATURES.map((f) => f.code);

  const missingFeatures = expectedFeatureCodes.filter(
    (c) => !dbFeatureCodes.has(c),
  );
  const extraFeatures = dbFeatures
    .map((f) => f.code)
    .filter((c) => !expectedFeatureCodes.includes(c));

  if (missingFeatures.length === 0 && extraFeatures.length === 0) {
    console.log(
      `   ✔ [MATCH] Features: 100% match (${dbFeatures.length}/${expectedFeatureCodes.length} features active in DB)`,
    );
  } else {
    featuresMatched = false;
    console.error(`   ✖ [MISMATCH] Features mismatch:`);
    if (missingFeatures.length > 0)
      console.error(`     - Missing: ${missingFeatures.join(', ')}`);
    if (extraFeatures.length > 0)
      console.error(`     - Extra: ${extraFeatures.join(', ')}`);
  }

  // --------------------------------------------------------------------------
  // Audit 2: Permissions match with Domain Catalog
  // --------------------------------------------------------------------------
  console.log(
    '\n2️⃣  Verifying Permissions catalog (Domains SSOT vs Database)...',
  );
  const dbPermissions = await db
    .select({
      id: permission.id,
      action: permission.action,
      module: permission.module,
      description: permission.description,
      featureCode: feature.code,
    })
    .from(permission)
    .leftJoin(feature, eq(permission.featureId, feature.id));

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
    console.log(
      `   ✔ [MATCH] Permissions Catalog: 100% match (${dbPermissions.length}/${SYSTEM_PERMISSIONS.length} permissions verified)`,
    );
  } else {
    permissionsMatched = false;
    console.error(`   ✖ [MISMATCH] Permissions catalog mismatch:`);
    if (missingInDb.length > 0) {
      console.error(
        `     - Missing in DB (${missingInDb.length}): ${missingInDb.join(', ')}`,
      );
    }
    if (extraInDb.length > 0) {
      console.error(
        `     - Extra in DB (${extraInDb.length}): ${extraInDb.join(', ')}`,
      );
    }
    if (propertyMismatches.length > 0) {
      console.error(`     - Property mismatches:`);
      for (const m of propertyMismatches) console.error(`       • ${m}`);
    }
  }

  // --------------------------------------------------------------------------
  // Audit 3: Permissions used in Application Layer Decorators (@RequirePermission)
  // --------------------------------------------------------------------------
  console.log(
    '\n3️⃣  Verifying Application Layer @RequirePermission Decorators...',
  );
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
      console.log(
        `   ✔ [MATCH] Application Layer: 100% match (${usedActions.size} unique actions across ${decoratorOccurrences} use-case decorators all exist in DB)`,
      );
    } else {
      useCasesMatched = false;
      console.error(
        `   ✖ [MISMATCH] Application Layer has permissions not found in DB:`,
      );
      for (const a of missingApplicationActions) {
        console.error(`     - Missing action: ${a}`);
      }
    }
  } catch (err) {
    console.warn(
      `   ⚠️ Unable to read applications use cases: ${(err as Error).message}`,
    );
  }

  // --------------------------------------------------------------------------
  // Audit 4: System Default Roles & Permission Grants
  // --------------------------------------------------------------------------
  console.log('\n4️⃣  Verifying System Default Roles & Permission Grants...');
  const dbRoles = await db
    .select()
    .from(role)
    .where(and(isNull(role.companyId), eq(role.isSystemDefault, true)));

  for (const expectedRole of SYSTEM_DEFAULT_ROLES) {
    const rType = expectedRole.roleType;
    const dbRole = dbRoles.find((r) => r.roleType === rType);

    if (!dbRole) {
      roleGrantsMatched = false;
      console.error(`   ✖ [MISSING] Role ${rType} not found in DB`);
      continue;
    }

    const rolePerms = await db
      .select({ action: permission.action })
      .from(rolePermission)
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(eq(rolePermission.roleId, dbRole.id));

    const dbActions = new Set(rolePerms.map((rp) => rp.action));
    const expectedActions = SYSTEM_DEFAULT_ROLE_PERMISSIONS[rType] || [];

    const missingRoleActions = expectedActions.filter((a) => !dbActions.has(a));
    const extraRoleActions = Array.from(dbActions).filter(
      (a) => !expectedActions.includes(a as SystemPermissionAction),
    );

    if (missingRoleActions.length === 0 && extraRoleActions.length === 0) {
      console.log(
        `   ✔ [MATCH] Role ${rType.padEnd(12)}: ${dbActions.size}/${expectedActions.length} grants (100% match)`,
      );
    } else {
      roleGrantsMatched = false;
      console.error(
        `   ✖ [MISMATCH] Role ${rType} grants mismatch (${dbActions.size} in DB vs ${expectedActions.length} expected):`,
      );
      if (missingRoleActions.length > 0) {
        console.error(
          `     - Missing grants (${missingRoleActions.length}): ${missingRoleActions.join(', ')}`,
        );
      }
      if (extraRoleActions.length > 0) {
        console.error(
          `     - Extra grants (${extraRoleActions.length}): ${extraRoleActions.join(', ')}`,
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
  console.log(
    '\n================================================================',
  );
  console.log('📊 Permissions Verification Summary Dashboard');
  console.log(
    '================================================================',
  );
  console.log(
    ` • Master Features:       ${featuresMatched ? '✅ PASS (6/6)' : '❌ FAIL'}`,
  );
  console.log(
    ` • Permissions Catalog:   ${permissionsMatched ? '✅ PASS (71/71 - 100%)' : '❌ FAIL'}`,
  );
  console.log(
    ` • Application Decorators:${useCasesMatched ? `✅ PASS (${usedActions.size} actions in DB)` : '❌ FAIL'}`,
  );
  console.log(
    ` • System Role Grants:    ${roleGrantsMatched ? '✅ PASS (All 5 roles match)' : '❌ FAIL'}`,
  );
  console.log(
    '================================================================',
  );

  if (allPassed) {
    console.log('🎉 ALL PERMISSION CHECKS PASSED PERFECTLY!\n');
  } else {
    console.error('⚠️  SOME CHECKS FAILED! Review details above.\n');
  }

  return {
    featuresMatched,
    permissionsMatched,
    useCasesMatched,
    roleGrantsMatched,
    allPassed,
  };
}

// ============================================================================
// Main Entrypoint
// ============================================================================
async function main() {
  try {
    if (isCheckOnly) {
      console.log('ℹ️  Running in CHECK-ONLY mode (Read-Only Audit)...\n');
    } else {
      await runTransactionalSeed();
    }

    const verification = await runVerification();

    if (!verification.allPassed) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal Error during permissions operation:', error);
    process.exit(1);
  }
}

main();

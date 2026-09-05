/**
 * Programmatic seed script for the database.
 *
 * Reads canonical data from @repo/domains constants and seeds:
 *   1. Master features
 *   2. System permissions (80 total)
 *   3. System default roles
 *   4. Role ↔ permission mappings
 *
 * Usage:
 *   npm run db:seed
 *
 * All inserts are idempotent — safe to run multiple times.
 */
import db from './db';
import {
  feature,
  permission,
  role,
  rolePermission,
  roleTypeEnum,
} from './schema';
import { MASTER_FEATURES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, SYSTEM_DEFAULT_ROLES } from '@repo/domains/constants';
import { eq, and, isNull, sql } from 'drizzle-orm';

async function seedFeatures() {
  console.log('🌱 Seeding features...');
  for (const f of MASTER_FEATURES) {
    await db
      .insert(feature)
      .values({
        code: f.code,
        name: f.name,
        description: f.description,
        category: f.category,
        isActive: f.isActive,
      })
      .onConflictDoUpdate({
        target: feature.code,
        set: {
          name: sql`EXCLUDED.name`,
          description: sql`EXCLUDED.description`,
          category: sql`EXCLUDED.category`,
          isActive: sql`EXCLUDED.is_active`,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`  ✓ ${MASTER_FEATURES.length} features seeded`);
}

async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  // Build feature code → id map
  const features = await db.select({ id: feature.id, code: feature.code }).from(feature);
  const featureMap = new Map(features.map((f) => [f.code, f.id]));

  for (const p of ALL_PERMISSIONS) {
    const featureId = p.featureCode ? featureMap.get(p.featureCode) : undefined;
    await db
      .insert(permission)
      .values({
        action: p.action,
        module: p.module,
        description: p.description,
        featureId: featureId ?? null,
      })
      .onConflictDoUpdate({
        target: permission.action,
        set: {
          module: sql`EXCLUDED.module`,
          description: sql`EXCLUDED.description`,
          featureId: sql`EXCLUDED.feature_id`,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`  ✓ ${ALL_PERMISSIONS.length} permissions seeded`);
}

async function seedRoles() {
  console.log('🌱 Seeding system default roles...');
  for (const r of SYSTEM_DEFAULT_ROLES) {
    const existing = await db
      .select({ id: role.id })
      .from(role)
      .where(
        and(
          eq(role.name, r.name),
          isNull(role.companyId),
          eq(role.isSystemDefault, true),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(role).values({
        name: r.name,
        description: r.description,
        roleType: r.roleType as (typeof roleTypeEnum.enumValues)[number],
        isSystemDefault: true,
        companyId: null,
      });
    } else {
      await db
        .update(role)
        .set({
          roleType: r.roleType as (typeof roleTypeEnum.enumValues)[number],
          description: r.description,
          updatedAt: new Date(),
        })
        .where(eq(role.id, existing[0]!.id));
    }
  }
  console.log(`  ✓ ${SYSTEM_DEFAULT_ROLES.length} roles seeded`);
}

async function seedRolePermissions() {
  console.log('🌱 Seeding role ↔ permission mappings...');

  // Build lookup maps
  const roles = await db
    .select({ id: role.id, roleType: role.roleType })
    .from(role)
    .where(eq(role.isSystemDefault, true));
  const roleMap = new Map(
    roles.map((r) => [r.roleType as string, r.id]),
  );


  const permissions = await db
    .select({ id: permission.id, action: permission.action })
    .from(permission);
  const permissionMap = new Map(permissions.map((p) => [p.action, p.id]));

  let inserted = 0;
  for (const mapping of DEFAULT_ROLE_PERMISSIONS) {
    const roleId = roleMap.get(mapping.roleType);
    if (!roleId) {
      console.warn(`  ⚠ Role not found: ${mapping.roleType}`);
      continue;
    }

    for (const action of mapping.actions) {
      const permId = permissionMap.get(action);
      if (!permId) {
        console.warn(`  ⚠ Permission not found: ${action}`);
        continue;
      }

      // Check for existing mapping before inserting
      const existing = await db
        .select({ id: rolePermission.id })
        .from(rolePermission)
        .where(
          and(
            eq(rolePermission.roleId, roleId),
            eq(rolePermission.permissionId, permId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db
          .insert(rolePermission)
          .values({ roleId, permissionId: permId });
        inserted++;
      }
    }
  }
  console.log(`  ✓ ${inserted} role-permission mappings inserted`);
}

async function main() {
  console.log('\n🚀 Starting database seed...\n');
  try {
    await seedFeatures();
    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();
    console.log('\n✅ Database seed completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();

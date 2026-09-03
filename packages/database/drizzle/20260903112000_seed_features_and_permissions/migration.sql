-- ============================================================================
-- Migration: 20260903112000_seed_features_and_permissions
-- Description: Seed master features, feature management permissions,
--              link existing permissions to features, and assign to system roles.
-- ============================================================================

-- 1. Seed Master Features Catalog
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT', 'Attendance Management', 'ระบบลงเวลาเข้างาน บันทึกกะ และตารางงาน', 'HR', true, now(), now()),
  (gen_random_uuid(), 'LEAVE_MANAGEMENT', 'Leave Management', 'ระบบยื่นและอนุมัติคำขอลาพักร้อน ลาป่วย ลากิจ', 'HR', true, now(), now()),
  (gen_random_uuid(), 'COMPANY_MANAGEMENT', 'Company Management', 'ระบบจัดการข้อมูลบริษัทและสาขา', 'ORGANIZATION', true, now(), now()),
  (gen_random_uuid(), 'ROLE_PERMISSION_MANAGEMENT', 'Access Control & Roles', 'ระบบจัดการบทบาทและสิทธิ์การเข้าถึง (RBAC)', 'SECURITY', true, now(), now()),
  (gen_random_uuid(), 'EMPLOYEE_MANAGEMENT', 'Employee Directory', 'ระบบจัดการข้อมูลสมาชิกและพนักงานในองค์กร', 'HR', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- 2. Seed Feature Management Permissions
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  v.action,
  v.module,
  v.description,
  f.id,
  now(),
  now()
FROM (
  VALUES
    -- Master Features
    ('feature:create', 'feature', 'Create new platform feature'),
    ('feature:read', 'feature', 'Read platform features catalog'),
    ('feature:update', 'feature', 'Update platform feature'),
    ('feature:delete', 'feature', 'Delete platform feature'),
    ('feature:toggle', 'feature', 'Toggle platform feature active status'),

    -- Company Features (Entitlement)
    ('company_feature:create', 'company_feature', 'Assign feature to company'),
    ('company_feature:read', 'company_feature', 'Read company feature entitlements'),
    ('company_feature:update', 'company_feature', 'Update company feature settings'),
    ('company_feature:delete', 'company_feature', 'Remove feature from company'),
    ('company_feature:toggle', 'company_feature', 'Toggle feature enablement for company'),

    -- Role Features (Delegation)
    ('role_feature:create', 'role_feature', 'Assign feature to company role'),
    ('role_feature:read', 'role_feature', 'Read role feature assignments'),
    ('role_feature:update', 'role_feature', 'Update role feature delegation'),
    ('role_feature:delete', 'role_feature', 'Revoke feature from company role'),
    ('role_feature:toggle', 'role_feature', 'Toggle role feature access'),
    ('role_feature:check', 'role_feature', 'Check role feature access status')
) AS v(action, module, description)
CROSS JOIN (
  SELECT id FROM "feature" WHERE "code" = 'ROLE_PERMISSION_MANAGEMENT' LIMIT 1
) f
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- 3. Link Existing Permissions to their Corresponding Features
-- 3.1 Attendance Feature
UPDATE "permission"
SET "feature_id" = (SELECT id FROM "feature" WHERE "code" = 'ATTENDANCE_MANAGEMENT' LIMIT 1),
    "updated_at" = now()
WHERE "module" IN (
  'attendance_policy',
  'attendance_checkpoint',
  'attendance_location',
  'attendance_record',
  'attendance_log',
  'work_schedule',
  'work_shift',
  'role_work_schedule'
);

--> statement-breakpoint

-- 3.2 Leave Feature
UPDATE "permission"
SET "feature_id" = (SELECT id FROM "feature" WHERE "code" = 'LEAVE_MANAGEMENT' LIMIT 1),
    "updated_at" = now()
WHERE "module" IN ('leave_request');

--> statement-breakpoint

-- 3.3 Company Feature
UPDATE "permission"
SET "feature_id" = (SELECT id FROM "feature" WHERE "code" = 'COMPANY_MANAGEMENT' LIMIT 1),
    "updated_at" = now()
WHERE "module" IN ('company', 'company_branch', 'company_member');

--> statement-breakpoint

-- 3.4 Role & Permission Feature
UPDATE "permission"
SET "feature_id" = (SELECT id FROM "feature" WHERE "code" = 'ROLE_PERMISSION_MANAGEMENT' LIMIT 1),
    "updated_at" = now()
WHERE "module" IN ('role', 'permission', 'role_permission', 'feature', 'company_feature', 'role_feature');

--> statement-breakpoint

-- 4. Map Permissions to System Roles
-- 4.1 SUPER_ADMIN gets all feature management permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN'
  AND r.is_system_default = true
  AND p.module IN ('feature', 'company_feature', 'role_feature')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 4.2 OWNER gets company_feature:read and all role_feature permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'OWNER'
  AND r.is_system_default = true
  AND (
    p.action = 'company_feature:read'
    OR p.module = 'role_feature'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 4.3 ADMIN gets company_feature:read and all role_feature permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'ADMIN'
  AND r.is_system_default = true
  AND (
    p.action = 'company_feature:read'
    OR p.module = 'role_feature'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 5. Backfill Existing Companies with Active Features
INSERT INTO "company_feature" ("id", "company_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  c.id,
  f.id,
  true,
  now(),
  now()
FROM "company" c
CROSS JOIN "feature" f
WHERE f.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM "company_feature" cf
    WHERE cf.company_id = c.id AND cf.feature_id = f.id
  );

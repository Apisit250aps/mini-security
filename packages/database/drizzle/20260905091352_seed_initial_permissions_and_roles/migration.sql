-- ============================================================================
-- Migration: seed_initial_permissions_and_roles
-- Description: Seed master features, all system permissions (80 total),
--              5 system default roles, and role-permission mappings.
--              All statements are fully idempotent (safe to re-run).
-- ============================================================================

-- ============================================================================
-- SECTION 1: Master Features Catalog
-- ============================================================================

INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT',    'Attendance Management',   'ระบบลงเวลาเข้างาน บันทึกกะ และตารางงาน',              'HR',           true, now(), now()),
  (gen_random_uuid(), 'LEAVE_MANAGEMENT',         'Leave Management',        'ระบบยื่นและอนุมัติคำขอลาพักร้อน ลาป่วย ลากิจ',         'HR',           true, now(), now()),
  (gen_random_uuid(), 'COMPANY_MANAGEMENT',       'Company Management',      'ระบบจัดการข้อมูลบริษัทและสาขา',                       'ORGANIZATION', true, now(), now()),
  (gen_random_uuid(), 'ROLE_PERMISSION_MANAGEMENT','Access Control & Roles', 'ระบบจัดการบทบาทและสิทธิ์การเข้าถึง (RBAC)',            'SECURITY',     true, now(), now()),
  (gen_random_uuid(), 'EMPLOYEE_MANAGEMENT',      'Employee Directory',      'ระบบจัดการข้อมูลสมาชิกและพนักงานในองค์กร',             'HR',           true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name"        = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category"    = EXCLUDED."category",
  "is_active"   = EXCLUDED."is_active",
  "updated_at"  = now();

--> statement-breakpoint

-- ============================================================================
-- SECTION 2: System Permissions
-- Each permission is linked to its corresponding master feature.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.1  User Module  (feature: EMPLOYEE_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    ('user:create', 'user', 'Create a new user'),
    ('user:read',   'user', 'Read user profiles and list users'),
    ('user:update', 'user', 'Update user profile information'),
    ('user:delete', 'user', 'Delete a user account')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'EMPLOYEE_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.2  Company Module  (feature: COMPANY_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    ('company:create',        'company',        'Create a new company / tenant'),
    ('company:read',          'company',        'Read company information and list companies'),
    ('company:update',        'company',        'Update company settings and metadata'),
    ('company:delete',        'company',        'Delete a company and its resources'),
    ('company_branch:create', 'company_branch', 'Create a new company branch'),
    ('company_branch:read',   'company_branch', 'Read company branch information and list branches'),
    ('company_branch:update', 'company_branch', 'Update company branch details and settings'),
    ('company_branch:delete', 'company_branch', 'Delete a company branch'),
    ('company_member:create', 'company_member', 'Invite or add members to a company'),
    ('company_member:read',   'company_member', 'View company members and membership details'),
    ('company_member:update', 'company_member', 'Update member roles or membership status'),
    ('company_member:delete', 'company_member', 'Remove members from a company')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'COMPANY_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.3  Role & Permission Modules  (feature: ROLE_PERMISSION_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    ('role:create',       'role',       'Create custom roles'),
    ('role:read',         'role',       'Read roles and their assigned permissions'),
    ('role:update',       'role',       'Update role details and configurations'),
    ('role:delete',       'role',       'Delete custom roles'),
    ('permission:create', 'permission', 'Create new system permissions'),
    ('permission:read',   'permission', 'Read and view system permissions'),
    ('permission:update', 'permission', 'Update permission details'),
    ('permission:delete', 'permission', 'Delete permissions'),
    ('permission:assign', 'permission', 'Assign permissions to roles'),
    ('permission:revoke', 'permission', 'Revoke permissions from roles')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'ROLE_PERMISSION_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.4  Feature Entitlement Modules  (feature: ROLE_PERMISSION_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    ('feature:create',         'feature',         'Create new platform feature'),
    ('feature:read',           'feature',         'Read platform features catalog'),
    ('feature:update',         'feature',         'Update platform feature'),
    ('feature:delete',         'feature',         'Delete platform feature'),
    ('feature:toggle',         'feature',         'Toggle platform feature active status'),
    ('company_feature:create', 'company_feature', 'Assign feature to company'),
    ('company_feature:read',   'company_feature', 'Read company feature entitlements'),
    ('company_feature:update', 'company_feature', 'Update company feature settings'),
    ('company_feature:delete', 'company_feature', 'Remove feature from company'),
    ('company_feature:toggle', 'company_feature', 'Toggle feature enablement for company'),
    ('role_feature:create',    'role_feature',    'Assign feature to company role'),
    ('role_feature:read',      'role_feature',    'Read role feature assignments'),
    ('role_feature:update',    'role_feature',    'Update role feature delegation'),
    ('role_feature:delete',    'role_feature',    'Revoke feature from company role'),
    ('role_feature:toggle',    'role_feature',    'Toggle role feature access'),
    ('role_feature:check',     'role_feature',    'Check role feature access status')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'ROLE_PERMISSION_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.5  Attendance Modules  (feature: ATTENDANCE_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    -- Work Schedule
    ('work_schedule:create',           'work_schedule',           'Create a new work schedule'),
    ('work_schedule:read',             'work_schedule',           'Read work schedules and shifts'),
    ('work_schedule:update',           'work_schedule',           'Update work schedules'),
    ('work_schedule:delete',           'work_schedule',           'Delete work schedules'),
    -- Work Shift
    ('work_shift:create',              'work_shift',              'Create a work shift'),
    ('work_shift:read',                'work_shift',              'Read work shifts'),
    ('work_shift:update',              'work_shift',              'Update work shifts'),
    ('work_shift:delete',              'work_shift',              'Delete work shifts'),
    -- Attendance Policy
    ('attendance_policy:create',       'attendance_policy',       'Create an attendance policy'),
    ('attendance_policy:read',         'attendance_policy',       'Read attendance policies and checkpoints'),
    ('attendance_policy:update',       'attendance_policy',       'Update attendance policies'),
    ('attendance_policy:delete',       'attendance_policy',       'Delete attendance policies'),
    -- Attendance Checkpoint
    ('attendance_checkpoint:create',   'attendance_checkpoint',   'Create an attendance checkpoint'),
    ('attendance_checkpoint:read',     'attendance_checkpoint',   'Read attendance checkpoints'),
    ('attendance_checkpoint:update',   'attendance_checkpoint',   'Update attendance checkpoints'),
    ('attendance_checkpoint:delete',   'attendance_checkpoint',   'Delete attendance checkpoints'),
    -- Attendance Location
    ('attendance_location:create',     'attendance_location',     'Create an attendance location'),
    ('attendance_location:read',       'attendance_location',     'Read attendance locations'),
    ('attendance_location:update',     'attendance_location',     'Update attendance locations'),
    ('attendance_location:delete',     'attendance_location',     'Delete attendance locations'),
    -- Role Work Schedule
    ('role_work_schedule:create',      'role_work_schedule',      'Assign work schedule/shift to roles'),
    ('role_work_schedule:read',        'role_work_schedule',      'Read role work schedules'),
    ('role_work_schedule:update',      'role_work_schedule',      'Update role work schedule assignments'),
    ('role_work_schedule:delete',      'role_work_schedule',      'Remove role work schedule assignments'),
    -- Attendance Record
    ('attendance_record:create',       'attendance_record',       'Create daily attendance records'),
    ('attendance_record:read',         'attendance_record',       'Read attendance records'),
    ('attendance_record:update',       'attendance_record',       'Update attendance records'),
    ('attendance_record:delete',       'attendance_record',       'Delete attendance records'),
    ('attendance_record:approve',      'attendance_record',       'Approve or reject attendance records'),
    -- Attendance Log
    ('attendance_log:create',          'attendance_log',          'Record attendance check-in / check-out log event'),
    ('attendance_log:read',            'attendance_log',          'Read attendance log history'),
    ('attendance_log:delete',          'attendance_log',          'Delete attendance log entries'),
    ('attendance_log:manual_check',    'attendance_log',          'Perform manual check-in on behalf of members')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'ATTENDANCE_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 2.6  Leave Request Module  (feature: LEAVE_MANAGEMENT)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (
  VALUES
    ('leave_request:create',  'leave_request', 'Submit leave requests'),
    ('leave_request:read',    'leave_request', 'Read leave requests'),
    ('leave_request:update',  'leave_request', 'Update leave requests'),
    ('leave_request:delete',  'leave_request', 'Delete or cancel leave requests'),
    ('leave_request:approve', 'leave_request', 'Approve or reject leave requests')
) AS v(action, module, description)
CROSS JOIN (SELECT id FROM "feature" WHERE "code" = 'LEAVE_MANAGEMENT' LIMIT 1) f
ON CONFLICT ("action") DO UPDATE SET
  "module"      = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id"  = EXCLUDED."feature_id",
  "updated_at"  = now();

--> statement-breakpoint

-- ============================================================================
-- SECTION 3: System Default Roles
-- company_id IS NULL = global system default (not tenant-scoped)
-- ============================================================================

INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, v.name, v.description, v.role_type::role_type, true, now(), now()
FROM (VALUES
  ('Super Admin', 'Full system access across all tenants and operations',              'SUPER_ADMIN'),
  ('Owner',       'Full administrative access to the company and organization resources','OWNER'),
  ('Admin',       'Administrative access with member management and view privileges',  'ADMIN'),
  ('Member',      'Standard member access with read and operational privileges',       'MEMBER'),
  ('Viewer',      'Read-only access to company resources and members',                 'VIEWER')
) AS v(name, description, role_type)
WHERE NOT EXISTS (
  SELECT 1 FROM "role"
  WHERE "name" = v.name AND "company_id" IS NULL AND "is_system_default" = true
);

--> statement-breakpoint

-- Backfill role_type for any pre-existing roles missing it (idempotent safety net)
UPDATE "role" SET "role_type" = 'SUPER_ADMIN' WHERE "name" = 'Super Admin' AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'OWNER'       WHERE "name" = 'Owner'       AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'ADMIN'        WHERE "name" = 'Admin'       AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'MEMBER'       WHERE "name" = 'Member'      AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'VIEWER'       WHERE "name" = 'Viewer'      AND "company_id" IS NULL AND "is_system_default" = true;

--> statement-breakpoint

-- ============================================================================
-- SECTION 4: Role ↔ Permission Mappings
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.1  SUPER_ADMIN → All permissions
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN'
  AND r.is_system_default = true
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.2  OWNER → Full company administrative access
--       Excludes: feature:create/update/delete/toggle, company_feature write ops
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'OWNER'
  AND r.is_system_default = true
  AND p.action IN (
    -- User (full)
    'user:create', 'user:read', 'user:update', 'user:delete',
    -- Company (full)
    'company:create', 'company:read', 'company:update', 'company:delete',
    -- Company Branch (full)
    'company_branch:create', 'company_branch:read', 'company_branch:update', 'company_branch:delete',
    -- Company Member (full)
    'company_member:create', 'company_member:read', 'company_member:update', 'company_member:delete',
    -- Role (full)
    'role:create', 'role:read', 'role:update', 'role:delete',
    -- Permission (read + assign + revoke)
    'permission:read', 'permission:assign', 'permission:revoke',
    -- Feature (read only)
    'feature:read',
    -- Company Feature (read only)
    'company_feature:read',
    -- Role Feature (full)
    'role_feature:create', 'role_feature:read', 'role_feature:update',
    'role_feature:delete', 'role_feature:toggle', 'role_feature:check',
    -- Work Schedule (full)
    'work_schedule:create', 'work_schedule:read', 'work_schedule:update', 'work_schedule:delete',
    -- Work Shift (full)
    'work_shift:create', 'work_shift:read', 'work_shift:update', 'work_shift:delete',
    -- Attendance Policy (full)
    'attendance_policy:create', 'attendance_policy:read', 'attendance_policy:update', 'attendance_policy:delete',
    -- Attendance Checkpoint (full)
    'attendance_checkpoint:create', 'attendance_checkpoint:read', 'attendance_checkpoint:update', 'attendance_checkpoint:delete',
    -- Attendance Location (full)
    'attendance_location:create', 'attendance_location:read', 'attendance_location:update', 'attendance_location:delete',
    -- Role Work Schedule (full)
    'role_work_schedule:create', 'role_work_schedule:read', 'role_work_schedule:update', 'role_work_schedule:delete',
    -- Attendance Record (full)
    'attendance_record:create', 'attendance_record:read', 'attendance_record:update',
    'attendance_record:delete', 'attendance_record:approve',
    -- Attendance Log (full)
    'attendance_log:create', 'attendance_log:read', 'attendance_log:delete', 'attendance_log:manual_check',
    -- Leave Request (full)
    'leave_request:create', 'leave_request:read', 'leave_request:update',
    'leave_request:delete', 'leave_request:approve'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.3  ADMIN → Administrative access (no company create/delete, no platform features)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'ADMIN'
  AND r.is_system_default = true
  AND p.action IN (
    -- User (read only)
    'user:read',
    -- Company (read + update)
    'company:read', 'company:update',
    -- Company Branch (full)
    'company_branch:create', 'company_branch:read', 'company_branch:update', 'company_branch:delete',
    -- Company Member (full)
    'company_member:create', 'company_member:read', 'company_member:update', 'company_member:delete',
    -- Role (read only)
    'role:read',
    -- Permission (read only)
    'permission:read',
    -- Feature (read only)
    'feature:read',
    -- Company Feature (read only)
    'company_feature:read',
    -- Role Feature (full)
    'role_feature:create', 'role_feature:read', 'role_feature:update',
    'role_feature:delete', 'role_feature:toggle', 'role_feature:check',
    -- Work Schedule (full)
    'work_schedule:create', 'work_schedule:read', 'work_schedule:update', 'work_schedule:delete',
    -- Work Shift (full)
    'work_shift:create', 'work_shift:read', 'work_shift:update', 'work_shift:delete',
    -- Attendance Policy (full)
    'attendance_policy:create', 'attendance_policy:read', 'attendance_policy:update', 'attendance_policy:delete',
    -- Attendance Checkpoint (full)
    'attendance_checkpoint:create', 'attendance_checkpoint:read', 'attendance_checkpoint:update', 'attendance_checkpoint:delete',
    -- Attendance Location (full)
    'attendance_location:create', 'attendance_location:read', 'attendance_location:update', 'attendance_location:delete',
    -- Role Work Schedule (full)
    'role_work_schedule:create', 'role_work_schedule:read', 'role_work_schedule:update', 'role_work_schedule:delete',
    -- Attendance Record (full)
    'attendance_record:create', 'attendance_record:read', 'attendance_record:update',
    'attendance_record:delete', 'attendance_record:approve',
    -- Attendance Log (full)
    'attendance_log:create', 'attendance_log:read', 'attendance_log:delete', 'attendance_log:manual_check',
    -- Leave Request (full)
    'leave_request:create', 'leave_request:read', 'leave_request:update',
    'leave_request:delete', 'leave_request:approve'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.4  MEMBER → Standard member access (self-service attendance + leave)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER'
  AND r.is_system_default = true
  AND p.action IN (
    -- User (read)
    'user:read',
    -- Company (read)
    'company:read',
    -- Company Branch (read)
    'company_branch:read',
    -- Company Member (read)
    'company_member:read',
    -- Role (read)
    'role:read',
    -- Permission (read)
    'permission:read',
    -- Feature (read)
    'feature:read',
    -- Company Feature (read)
    'company_feature:read',
    -- Role Feature (read + check)
    'role_feature:read', 'role_feature:check',
    -- Work Schedule (read)
    'work_schedule:read',
    -- Work Shift (read)
    'work_shift:read',
    -- Attendance Policy (read)
    'attendance_policy:read',
    -- Attendance Checkpoint (read)
    'attendance_checkpoint:read',
    -- Attendance Location (read)
    'attendance_location:read',
    -- Role Work Schedule (read)
    'role_work_schedule:read',
    -- Attendance Record (read)
    'attendance_record:read',
    -- Attendance Log (create + read — self check-in)
    'attendance_log:create', 'attendance_log:read',
    -- Leave Request (create + read + update + delete — self-service, no approve)
    'leave_request:create', 'leave_request:read', 'leave_request:update', 'leave_request:delete'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ─────────────────────────────────────────────────────────────────────────────
-- 4.5  VIEWER → Read-only access to all resources
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'VIEWER'
  AND r.is_system_default = true
  AND p.action IN (
    -- User (read)
    'user:read',
    -- Company (read)
    'company:read',
    -- Company Branch (read)
    'company_branch:read',
    -- Company Member (read)
    'company_member:read',
    -- Role (read)
    'role:read',
    -- Permission (read)
    'permission:read',
    -- Feature (read)
    'feature:read',
    -- Company Feature (read)
    'company_feature:read',
    -- Role Feature (read)
    'role_feature:read',
    -- Work Schedule (read)
    'work_schedule:read',
    -- Work Shift (read)
    'work_shift:read',
    -- Attendance Policy (read)
    'attendance_policy:read',
    -- Attendance Checkpoint (read)
    'attendance_checkpoint:read',
    -- Attendance Location (read)
    'attendance_location:read',
    -- Role Work Schedule (read)
    'role_work_schedule:read',
    -- Attendance Record (read)
    'attendance_record:read',
    -- Attendance Log (read)
    'attendance_log:read',
    -- Leave Request (read)
    'leave_request:read'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
-- ============================================================================
-- Migration: 20260906054100_seed_attendance_and_leave_permissions
-- Description: Seed Attendance and Leave features, define granular permissions,
--              map to system default roles, and backfill company feature entitlements.
-- ============================================================================

-- ขั้นตอนที่ 1: Seed Master Feature Catalog (ตาราง "feature")
-- ----------------------------------------------------------------------------
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT', 'Attendance Management', 'ระบบลงเวลาเข้างาน บันทึกกะ และตารางเวลาเช็คชื่อตามตำแหน่ง', 'HR', true, now(), now()),
  (gen_random_uuid(), 'LEAVE_MANAGEMENT', 'Leave Management', 'ระบบยื่นและอนุมัติคำขอลา ประเภทการลา และโควต้าวันลาประจำปี', 'HR', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 2: Seed Permissions (ตาราง "permission")
-- ----------------------------------------------------------------------------
-- 2.1 Attendance Module Permissions
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
    ('attendance:check_in', 'attendance', 'Check-in attendance for current slot'),
    ('attendance:read',     'attendance', 'View attendance logs and summaries'),
    ('attendance:manage',   'attendance', 'Manage, override or edit attendance logs'),
    ('attendance_schedule:read',   'attendance_schedule', 'View check-in schedules and slots'),
    ('attendance_schedule:manage', 'attendance_schedule', 'Configure check-in schedules and slots')
) AS v(action, module, description)
CROSS JOIN (
  SELECT id FROM "feature" WHERE "code" = 'ATTENDANCE_MANAGEMENT' LIMIT 1
) f
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- 2.2 Leave Management Permissions
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
    ('leave_type:read',      'leave', 'View company leave types'),
    ('leave_type:manage',    'leave', 'Manage company leave types and policies'),
    ('leave_quota:read',     'leave', 'View member annual leave quotas'),
    ('leave_quota:manage',   'leave', 'Manage member annual leave quotas'),
    ('leave_request:create', 'leave', 'Submit leave requests'),
    ('leave_request:read',   'leave', 'View leave requests and history'),
    ('leave_request:approve','leave', 'Approve or reject leave requests'),
    ('leave_request:cancel', 'leave', 'Cancel submitted leave requests')
) AS v(action, module, description)
CROSS JOIN (
  SELECT id FROM "feature" WHERE "code" = 'LEAVE_MANAGEMENT' LIMIT 1
) f
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 3: Map Permissions สู่ System Default Roles (ตาราง "role_permission")
-- ----------------------------------------------------------------------------
-- 3.1 SUPER_ADMIN -> ได้รับสิทธิ์ทั้งหมดของ Attendance และ Leave
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN' AND r.is_system_default = true
  AND p.module IN ('attendance', 'attendance_schedule', 'leave')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.2 OWNER & ADMIN -> ได้รับสิทธิ์ทั้งหมดของ Attendance และ Leave
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type IN ('OWNER', 'ADMIN') AND r.is_system_default = true
  AND p.module IN ('attendance', 'attendance_schedule', 'leave')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.3 MEMBER -> สิทธิ์ลงเวลา, ดูตารางเวลา, ดูประเภทการลา, ดูโควต้าตนเอง, ยื่น/ดู/ยกเลิกใบลา
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER' AND r.is_system_default = true
  AND p.action IN (
    'attendance:check_in',
    'attendance:read',
    'attendance_schedule:read',
    'leave_type:read',
    'leave_quota:read',
    'leave_request:create',
    'leave_request:read',
    'leave_request:cancel'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.4 VIEWER -> สิทธิ์ดูข้อมูล
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'VIEWER' AND r.is_system_default = true
  AND p.action IN (
    'attendance:read',
    'attendance_schedule:read',
    'leave_type:read',
    'leave_quota:read',
    'leave_request:read'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ขั้นตอนที่ 4: Backfill Company Entitlements (ตาราง "company_feature")
-- ----------------------------------------------------------------------------
INSERT INTO "company_feature" ("id", "company_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), c.id, f.id, true, now(), now()
FROM "company" c
CROSS JOIN "feature" f
WHERE f.code IN ('ATTENDANCE_MANAGEMENT', 'LEAVE_MANAGEMENT') AND f.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM "company_feature" cf WHERE cf.company_id = c.id AND cf.feature_id = f.id
  );

--> statement-breakpoint

-- ขั้นตอนที่ 5: Delegate Feature สู่ Company Roles (ตาราง "role_feature")
-- ----------------------------------------------------------------------------
INSERT INTO "role_feature" ("id", "company_id", "role_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), r.company_id, r.id, f.id, true, now(), now()
FROM "role" r
CROSS JOIN "feature" f
WHERE f.code IN ('ATTENDANCE_MANAGEMENT', 'LEAVE_MANAGEMENT')
  AND r.role_type IN ('OWNER', 'ADMIN', 'MEMBER')
  AND r.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "role_feature" rf WHERE rf.role_id = r.id AND rf.feature_id = f.id
  );

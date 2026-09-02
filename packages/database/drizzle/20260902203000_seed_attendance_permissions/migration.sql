-- Migration: 20260902203000_seed_attendance_permissions
-- Description: Seed attendance module permissions and assign them to system default roles

-- 1. Seed Attendance Module Permissions
INSERT INTO "permission" ("id", "action", "module", "description", "created_at", "updated_at")
VALUES
  -- Work Schedule Module
  (gen_random_uuid(), 'work_schedule:create', 'work_schedule', 'Create a new work schedule', now(), now()),
  (gen_random_uuid(), 'work_schedule:read', 'work_schedule', 'Read work schedules and shifts', now(), now()),
  (gen_random_uuid(), 'work_schedule:update', 'work_schedule', 'Update work schedules', now(), now()),
  (gen_random_uuid(), 'work_schedule:delete', 'work_schedule', 'Delete work schedules', now(), now()),

  -- Work Shift Module
  (gen_random_uuid(), 'work_shift:create', 'work_shift', 'Create a work shift', now(), now()),
  (gen_random_uuid(), 'work_shift:read', 'work_shift', 'Read work shifts', now(), now()),
  (gen_random_uuid(), 'work_shift:update', 'work_shift', 'Update work shifts', now(), now()),
  (gen_random_uuid(), 'work_shift:delete', 'work_shift', 'Delete work shifts', now(), now()),

  -- Attendance Policy Module
  (gen_random_uuid(), 'attendance_policy:create', 'attendance_policy', 'Create an attendance policy', now(), now()),
  (gen_random_uuid(), 'attendance_policy:read', 'attendance_policy', 'Read attendance policies and checkpoints', now(), now()),
  (gen_random_uuid(), 'attendance_policy:update', 'attendance_policy', 'Update attendance policies', now(), now()),
  (gen_random_uuid(), 'attendance_policy:delete', 'attendance_policy', 'Delete attendance policies', now(), now()),

  -- Attendance Checkpoint Module
  (gen_random_uuid(), 'attendance_checkpoint:create', 'attendance_checkpoint', 'Create an attendance checkpoint', now(), now()),
  (gen_random_uuid(), 'attendance_checkpoint:read', 'attendance_checkpoint', 'Read attendance checkpoints', now(), now()),
  (gen_random_uuid(), 'attendance_checkpoint:update', 'attendance_checkpoint', 'Update attendance checkpoints', now(), now()),
  (gen_random_uuid(), 'attendance_checkpoint:delete', 'attendance_checkpoint', 'Delete attendance checkpoints', now(), now()),

  -- Attendance Location Module
  (gen_random_uuid(), 'attendance_location:create', 'attendance_location', 'Create an attendance location', now(), now()),
  (gen_random_uuid(), 'attendance_location:read', 'attendance_location', 'Read attendance locations', now(), now()),
  (gen_random_uuid(), 'attendance_location:update', 'attendance_location', 'Update attendance locations', now(), now()),
  (gen_random_uuid(), 'attendance_location:delete', 'attendance_location', 'Delete attendance locations', now(), now()),

  -- Member Work Schedule Module
  (gen_random_uuid(), 'member_work_schedule:create', 'member_work_schedule', 'Assign work schedule/shift to members', now(), now()),
  (gen_random_uuid(), 'member_work_schedule:read', 'member_work_schedule', 'Read member work schedules', now(), now()),
  (gen_random_uuid(), 'member_work_schedule:update', 'member_work_schedule', 'Update member work schedule assignments', now(), now()),
  (gen_random_uuid(), 'member_work_schedule:delete', 'member_work_schedule', 'Remove member work schedule assignments', now(), now()),

  -- Attendance Record Module
  (gen_random_uuid(), 'attendance_record:create', 'attendance_record', 'Create daily attendance records', now(), now()),
  (gen_random_uuid(), 'attendance_record:read', 'attendance_record', 'Read attendance records', now(), now()),
  (gen_random_uuid(), 'attendance_record:update', 'attendance_record', 'Update attendance records', now(), now()),
  (gen_random_uuid(), 'attendance_record:delete', 'attendance_record', 'Delete attendance records', now(), now()),
  (gen_random_uuid(), 'attendance_record:approve', 'attendance_record', 'Approve or reject attendance records', now(), now()),

  -- Attendance Log Module
  (gen_random_uuid(), 'attendance_log:create', 'attendance_log', 'Record attendance check-in / check-out log event', now(), now()),
  (gen_random_uuid(), 'attendance_log:read', 'attendance_log', 'Read attendance log history', now(), now()),
  (gen_random_uuid(), 'attendance_log:delete', 'attendance_log', 'Delete attendance log entries', now(), now()),
  (gen_random_uuid(), 'attendance_log:manual_check', 'attendance_log', 'Perform manual check-in on behalf of members', now(), now()),

  -- Leave Request Module
  (gen_random_uuid(), 'leave_request:create', 'leave_request', 'Submit leave requests', now(), now()),
  (gen_random_uuid(), 'leave_request:read', 'leave_request', 'Read leave requests', now(), now()),
  (gen_random_uuid(), 'leave_request:update', 'leave_request', 'Update leave requests', now(), now()),
  (gen_random_uuid(), 'leave_request:delete', 'leave_request', 'Delete or cancel leave requests', now(), now()),
  (gen_random_uuid(), 'leave_request:approve', 'leave_request', 'Approve or reject leave requests', now(), now())
ON CONFLICT ("action") DO UPDATE
SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "updated_at" = now();

--> statement-breakpoint

-- 2. Assign Attendance Permissions to System Default Roles

-- 2.1 Super Admin -> All Attendance Permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Super Admin' AND r.company_id IS NULL AND r.is_system_default = true
AND p.module IN (
  'work_schedule', 'work_shift', 'attendance_policy', 'attendance_checkpoint',
  'attendance_location', 'member_work_schedule', 'attendance_record',
  'attendance_log', 'leave_request'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.2 Owner -> All Attendance Permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Owner' AND r.company_id IS NULL AND r.is_system_default = true
AND p.module IN (
  'work_schedule', 'work_shift', 'attendance_policy', 'attendance_checkpoint',
  'attendance_location', 'member_work_schedule', 'attendance_record',
  'attendance_log', 'leave_request'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.3 Admin -> All Attendance Permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Admin' AND r.company_id IS NULL AND r.is_system_default = true
AND p.module IN (
  'work_schedule', 'work_shift', 'attendance_policy', 'attendance_checkpoint',
  'attendance_location', 'member_work_schedule', 'attendance_record',
  'attendance_log', 'leave_request'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.4 Member -> Member Operational & Read Access
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Member' AND r.company_id IS NULL AND r.is_system_default = true
AND p.action IN (
  'work_schedule:read',
  'work_shift:read',
  'attendance_policy:read',
  'attendance_checkpoint:read',
  'attendance_location:read',
  'member_work_schedule:read',
  'attendance_record:read',
  'attendance_log:create',
  'attendance_log:read',
  'leave_request:create',
  'leave_request:read',
  'leave_request:update',
  'leave_request:delete'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.5 Viewer -> Read-only Access
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Viewer' AND r.company_id IS NULL AND r.is_system_default = true
AND p.action IN (
  'work_schedule:read',
  'work_shift:read',
  'attendance_policy:read',
  'attendance_checkpoint:read',
  'attendance_location:read',
  'member_work_schedule:read',
  'attendance_record:read',
  'attendance_log:read',
  'leave_request:read'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.6 Custom Company Roles Backfill
-- Custom MEMBER roles -> Member Attendance Permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER' AND r.company_id IS NOT NULL
AND p.action IN (
  'work_schedule:read',
  'work_shift:read',
  'attendance_policy:read',
  'attendance_checkpoint:read',
  'attendance_location:read',
  'member_work_schedule:read',
  'attendance_record:read',
  'attendance_log:create',
  'attendance_log:read',
  'leave_request:create',
  'leave_request:read',
  'leave_request:update',
  'leave_request:delete'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- Custom ADMIN or OWNER roles -> All Attendance Permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type IN ('ADMIN', 'OWNER') AND r.company_id IS NOT NULL
AND p.module IN (
  'work_schedule', 'work_shift', 'attendance_policy', 'attendance_checkpoint',
  'attendance_location', 'member_work_schedule', 'attendance_record',
  'attendance_log', 'leave_request'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);


-- Migration: 20260902024350_seed_company_branch_permissions
-- Description: Seed company_branch module permissions and assign them to system default roles

-- 1. Seed Company Branch Module Permissions
INSERT INTO "permission" ("id", "action", "module", "description", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'company_branch:create', 'company_branch', 'Create a new company branch', now(), now()),
  (gen_random_uuid(), 'company_branch:read', 'company_branch', 'Read company branch information and list branches', now(), now()),
  (gen_random_uuid(), 'company_branch:update', 'company_branch', 'Update company branch details and settings', now(), now()),
  (gen_random_uuid(), 'company_branch:delete', 'company_branch', 'Delete a company branch', now(), now())
ON CONFLICT ("action") DO UPDATE
SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "updated_at" = now();

--> statement-breakpoint

-- 2. Assign Company Branch Permissions to System Default Roles

-- 2.1 Super Admin -> All Company Branch Permissions
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
AND p.module = 'company_branch'
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.2 Owner -> All Company Branch Permissions (Create, Read, Update, Delete)
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
AND p.action IN (
  'company_branch:create',
  'company_branch:read',
  'company_branch:update',
  'company_branch:delete'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.3 Admin -> All Company Branch Permissions (Create, Read, Update, Delete)
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
AND p.action IN (
  'company_branch:create',
  'company_branch:read',
  'company_branch:update',
  'company_branch:delete'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.4 Member -> Company Branch Read Access
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
AND p.action = 'company_branch:read'
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 2.5 Viewer -> Company Branch Read Access
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
AND p.action = 'company_branch:read'
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
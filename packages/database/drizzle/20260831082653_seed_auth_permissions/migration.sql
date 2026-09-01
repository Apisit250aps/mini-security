-- Migration: 20260831082653_seed_auth_permissions
-- Description: Seed initial system permissions, default roles (with role_type), and role_permission mappings

-- 1. Seed Permissions
INSERT INTO "permission" ("id", "action", "module", "description", "created_at", "updated_at")
VALUES
  -- User Module
  (gen_random_uuid(), 'user:create', 'user', 'Create a new user', now(), now()),
  (gen_random_uuid(), 'user:read', 'user', 'Read user profiles and list users', now(), now()),
  (gen_random_uuid(), 'user:update', 'user', 'Update user profile information', now(), now()),
  (gen_random_uuid(), 'user:delete', 'user', 'Delete a user account', now(), now()),

  -- Company Module
  (gen_random_uuid(), 'company:create', 'company', 'Create a new company / tenant', now(), now()),
  (gen_random_uuid(), 'company:read', 'company', 'Read company information and list companies', now(), now()),
  (gen_random_uuid(), 'company:update', 'company', 'Update company settings and metadata', now(), now()),
  (gen_random_uuid(), 'company:delete', 'company', 'Delete a company and its resources', now(), now()),

  -- Company Member Module
  (gen_random_uuid(), 'company_member:create', 'company_member', 'Invite or add members to a company', now(), now()),
  (gen_random_uuid(), 'company_member:read', 'company_member', 'View company members and membership details', now(), now()),
  (gen_random_uuid(), 'company_member:update', 'company_member', 'Update member roles or membership status', now(), now()),
  (gen_random_uuid(), 'company_member:delete', 'company_member', 'Remove members from a company', now(), now()),

  -- Role Module
  (gen_random_uuid(), 'role:create', 'role', 'Create custom roles', now(), now()),
  (gen_random_uuid(), 'role:read', 'role', 'Read roles and their assigned permissions', now(), now()),
  (gen_random_uuid(), 'role:update', 'role', 'Update role details and configurations', now(), now()),
  (gen_random_uuid(), 'role:delete', 'role', 'Delete custom roles', now(), now()),

  -- Permission Module
  (gen_random_uuid(), 'permission:create', 'permission', 'Create new system permissions', now(), now()),
  (gen_random_uuid(), 'permission:read', 'permission', 'Read and view system permissions', now(), now()),
  (gen_random_uuid(), 'permission:update', 'permission', 'Update permission details', now(), now()),
  (gen_random_uuid(), 'permission:delete', 'permission', 'Delete permissions', now(), now()),
  (gen_random_uuid(), 'permission:assign', 'permission', 'Assign permissions to roles', now(), now()),
  (gen_random_uuid(), 'permission:revoke', 'permission', 'Revoke permissions from roles', now(), now())
ON CONFLICT ("action") DO UPDATE
SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "updated_at" = now();

--> statement-breakpoint

-- 2. Seed System Default Roles (company_id is NULL for global system default roles)
INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, 'Super Admin', 'Full system access across all tenants and operations', 'SUPER_ADMIN', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Super Admin' AND "company_id" IS NULL AND "is_system_default" = true);

--> statement-breakpoint

INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, 'Owner', 'Full administrative access to the company and organization resources', 'OWNER', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Owner' AND "company_id" IS NULL AND "is_system_default" = true);

--> statement-breakpoint

INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, 'Admin', 'Administrative access with member management and view privileges', 'ADMIN', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Admin' AND "company_id" IS NULL AND "is_system_default" = true);

--> statement-breakpoint

INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, 'Member', 'Standard member access with read and operational privileges', 'MEMBER', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Member' AND "company_id" IS NULL AND "is_system_default" = true);

--> statement-breakpoint

INSERT INTO "role" ("id", "company_id", "name", "description", "role_type", "is_system_default", "created_at", "updated_at")
SELECT gen_random_uuid(), NULL, 'Viewer', 'Read-only access to company resources and members', 'VIEWER', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Viewer' AND "company_id" IS NULL AND "is_system_default" = true);

--> statement-breakpoint

-- 2.1 Backfill role_type for any pre-existing default roles missing it (safety net for repeated runs)
UPDATE "role" SET "role_type" = 'SUPER_ADMIN' WHERE "name" = 'Super Admin' AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'OWNER' WHERE "name" = 'Owner' AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'ADMIN' WHERE "name" = 'Admin' AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'MEMBER' WHERE "name" = 'Member' AND "company_id" IS NULL AND "is_system_default" = true;
UPDATE "role" SET "role_type" = 'VIEWER' WHERE "name" = 'Viewer' AND "company_id" IS NULL AND "is_system_default" = true;

--> statement-breakpoint

-- 3. Assign Permissions to System Default Roles

-- 3.1 Super Admin -> All Permissions
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
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 3.2 Owner -> All Company, Member, Role, User Read, and Permission Assignment
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
  'company:create', 'company:read', 'company:update', 'company:delete',
  'company_member:create', 'company_member:read', 'company_member:update', 'company_member:delete',
  'role:create', 'role:read', 'role:update', 'role:delete',
  'permission:read', 'permission:assign', 'permission:revoke',
  'user:read'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 3.3 Admin -> Company Read/Update, Member Management, Role Read, Permission Read, User Read
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
  'company:read', 'company:update',
  'company_member:create', 'company_member:read', 'company_member:update', 'company_member:delete',
  'role:read',
  'permission:read',
  'user:read'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 3.4 Member -> Standard Read Access
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
  'company:read',
  'company_member:read',
  'role:read',
  'user:read'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

--> statement-breakpoint

-- 3.5 Viewer -> Read-only Access
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
  'company:read',
  'company_member:read',
  'user:read'
)
AND NOT EXISTS (
  SELECT 1 FROM "role_permission" rp
  WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

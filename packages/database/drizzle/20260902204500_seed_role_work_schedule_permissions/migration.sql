-- ============================================================================
-- Seed Permissions for Role Work Schedule Module & Map to Roles
-- ============================================================================

-- 1. Insert or update permissions for role_work_schedule
INSERT INTO "permission" ("id", "action", "module", "description", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'role_work_schedule:create', 'role_work_schedule', 'Assign work schedule/shift to roles', now(), now()),
  (gen_random_uuid(), 'role_work_schedule:read', 'role_work_schedule', 'Read role work schedules', now(), now()),
  (gen_random_uuid(), 'role_work_schedule:update', 'role_work_schedule', 'Update role work schedule assignments', now(), now()),
  (gen_random_uuid(), 'role_work_schedule:delete', 'role_work_schedule', 'Remove role work schedule assignments', now(), now())
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "updated_at" = now();

--> statement-breakpoint

-- 2. Map role_work_schedule permissions to SUPER_ADMIN
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
  AND p.module = 'role_work_schedule'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3. Map role_work_schedule permissions to OWNER
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
  AND p.module = 'role_work_schedule'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 4. Map role_work_schedule permissions to ADMIN
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
  AND p.module = 'role_work_schedule'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 5. Map role_work_schedule:read to MEMBER
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER'
  AND r.is_system_default = true
  AND p.action = 'role_work_schedule:read'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 6. Map role_work_schedule:read to VIEWER
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'VIEWER'
  AND r.is_system_default = true
  AND p.action = 'role_work_schedule:read'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 7. Backfill for existing custom company roles
-- 7.1 Custom OWNER / ADMIN roles get full permissions
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.is_system_default = false
  AND r.role_type IN ('OWNER', 'ADMIN')
  AND p.module = 'role_work_schedule'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 7.2 Custom MEMBER / VIEWER roles get read permission
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  r.id,
  p.id,
  now(),
  now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.is_system_default = false
  AND r.role_type IN ('MEMBER', 'VIEWER')
  AND p.action = 'role_work_schedule:read'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 8. Clean up obsolete member_work_schedule permissions
DELETE FROM "role_permission"
WHERE permission_id IN (
  SELECT id FROM "permission" WHERE module = 'member_work_schedule'
);

--> statement-breakpoint

DELETE FROM "permission"
WHERE module = 'member_work_schedule';

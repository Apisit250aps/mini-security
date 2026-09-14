-- ============================================================================
-- Migration: 20260913043200_seed_location_permissions
-- Description: Seed location permissions, map to system default roles,
--              and ensure attendance management bindings.
-- ============================================================================

-- Step 1: Seed / Ensure Master Feature Catalog (table "feature")
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT', 'Attendance Management', 'Attendance logs and check-in schedules', 'HR', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- Step 2: Seed Permissions (table "permission")
INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (VALUES
  ('location:manage', 'location', 'location manage', 'ATTENDANCE_MANAGEMENT'),
  ('location:read', 'location', 'location read', 'ATTENDANCE_MANAGEMENT')
) AS v(action, module, description, feature_code)
JOIN "feature" f ON f.code = v.feature_code
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- Step 3: Map Permissions to System Default Roles (table "role_permission")
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM (VALUES
  ('SUPER_ADMIN', 'location:manage'),
  ('SUPER_ADMIN', 'location:read'),
  ('OWNER', 'location:manage'),
  ('OWNER', 'location:read'),
  ('ADMIN', 'location:manage'),
  ('ADMIN', 'location:read'),
  ('MEMBER', 'location:read'),
  ('VIEWER', 'location:read')
) AS v(role_type, action)
JOIN "role" r ON r.role_type = v.role_type::role_type AND r.company_id IS NULL AND r.is_system_default = true
JOIN "permission" p ON p.action = v.action
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- ============================================================================
-- Migration: 20260915210100_seed_form_permissions
-- Description: Seed FORM_MANAGEMENT feature, define permissions, map to roles,
--              and backfill company feature entitlements.
-- ============================================================================

-- ขั้นตอนที่ 1: Seed Master Feature Catalog (ตาราง "feature")
-- ----------------------------------------------------------------------------
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'FORM_MANAGEMENT', 'Form Management', 'ระบบฟอร์ม แผนงาน การมอบหมาย และการตรวจ', 'SECURITY', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 2: Seed Permissions (ตาราง "permission")
-- ----------------------------------------------------------------------------
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
    ('form_template:create', 'form_template', 'Create form templates'),
    ('form_template:read', 'form_template', 'View form templates'),
    ('form_template:manage', 'form_template', 'Manage form templates (edit, archive, publish)'),
    ('form_plan:manage', 'form_plan', 'Create and manage form plans and schedules'),
    ('form_plan:read', 'form_plan', 'View form plans and occurrences'),
    ('form_submission:create', 'form_submission', 'Start a new form submission draft'),
    ('form_submission:update', 'form_submission', 'Save draft answers'),
    ('form_submission:submit', 'form_submission', 'Submit a completed form'),
    ('form_submission:read', 'form_submission', 'View form submissions'),
    ('form_review:answer', 'form_review', 'Review individual answers (PASS/NEEDS_CHANGES)'),
    ('form_review:section', 'form_review', 'Review form sections (PASS/NEEDS_CHANGES)'),
    ('form_review:finalize', 'form_review', 'Finalize submission review (APPROVE/RETURN)'),
    ('form_review:read', 'form_review', 'View review entries and history'),
    ('form_review:self', 'form_review', 'Allow reviewing own submissions (requires another review permission)')
) AS v(action, module, description)
CROSS JOIN (
  SELECT id FROM "feature" WHERE "code" = 'FORM_MANAGEMENT' LIMIT 1
) f
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 3: Map Permissions สู่ System Default Roles (ตาราง "role_permission")
-- ----------------------------------------------------------------------------
-- 3.1 SUPER_ADMIN
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN' AND r.is_system_default = true
  AND p.module IN ('form_template', 'form_plan', 'form_submission', 'form_review')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.2 OWNER & ADMIN
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type IN ('OWNER', 'ADMIN') AND r.is_system_default = true
  AND p.module IN ('form_template', 'form_plan', 'form_submission', 'form_review')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.3 MEMBER
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER' AND r.is_system_default = true
  AND p.action IN (
    'form_template:read',
    'form_submission:create',
    'form_submission:update',
    'form_submission:submit',
    'form_submission:read',
    'form_review:read'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.4 VIEWER
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'VIEWER' AND r.is_system_default = true
  AND p.action IN (
    'form_template:read',
    'form_submission:read',
    'form_review:read'
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
WHERE f.code = 'FORM_MANAGEMENT' AND f.is_active = true
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
WHERE f.code = 'FORM_MANAGEMENT'
  AND r.role_type IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')
  AND r.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "role_feature" rf WHERE rf.role_id = r.id AND rf.feature_id = f.id
  );

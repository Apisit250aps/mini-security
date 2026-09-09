-- ============================================================================
-- Migration: 20260909120100_seed_form_permissions
-- Description: Seed Form Management feature, define permissions, map to system roles,
--              and backfill company feature entitlements.
-- ============================================================================

-- ขั้นตอนที่ 1: Seed Master Feature Catalog (ตาราง "feature")
-- ----------------------------------------------------------------------------
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'FORM_MANAGEMENT', 'Form Management', 'ระบบสร้างฟอร์ม กรอกคำตอบร่วมตามบทบาท และการอนุมัติ', 'OPERATIONS', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = now();

--> statement-breakpoint

-- ขั้นตอนที่ 2: Seed Permissions (ตาราง "permission")
-- Format action: "<module>:<action>"
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
    ('form_template:create',  'form_template',   'Create dynamic form templates and versions'),
    ('form_template:read',    'form_template',   'View dynamic form templates and questions'),
    ('form_template:update',  'form_template',   'Edit form templates, sections, and fields'),
    ('form_template:delete',  'form_template',   'Delete or archive form templates'),
    ('form_template:publish', 'form_template',   'Publish form versions to company roles'),
    ('form_submission:create','form_submission', 'Start or clone shared form submission'),
    ('form_submission:read',  'form_submission', 'View shared form responses and review history'),
    ('form_submission:update','form_submission', 'Edit draft form answers and attachments'),
    ('form_submission:submit','form_submission', 'Submit completed form response for owner review'),
    ('form_submission:review','form_submission', 'Approve or reject submitted responses as owner')
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
-- 3.1 SUPER_ADMIN -> ได้รับสิทธิ์ทั้งหมดของโมดูลฟอร์ม
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'SUPER_ADMIN' AND r.is_system_default = true
  AND p.module IN ('form_template', 'form_submission')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.2 OWNER & ADMIN -> ได้รับสิทธิ์บริหารจัดการและอ่าน
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type IN ('OWNER', 'ADMIN') AND r.is_system_default = true
  AND p.module IN ('form_template', 'form_submission')
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.3 MEMBER -> ได้รับสิทธิ์อ่านแบบฟอร์ม, เริ่มกรอก, แก้ไขแบบร่าง และส่งคำตอบ
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'MEMBER' AND r.is_system_default = true
  AND p.action IN (
    'form_template:read',
    'form_submission:create',
    'form_submission:read',
    'form_submission:update',
    'form_submission:submit'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- 3.4 VIEWER -> ได้รับเฉพาะสิทธิ์อ่าน
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at", "updated_at")
SELECT gen_random_uuid(), r.id, p.id, now(), now()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.role_type = 'VIEWER' AND r.is_system_default = true
  AND p.action IN (
    'form_template:read',
    'form_submission:read'
  )
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

--> statement-breakpoint

-- ขั้นตอนที่ 4: Backfill Company Entitlements (ตาราง "company_feature")
-- เปิดใช้งานฟีเจอร์นี้ให้กับทุกบริษัทที่มีอยู่ในระบบ
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
-- กำหนดว่า Role ใดในบริษัทสามารถมองเห็นและเข้าถึง Feature นี้ได้
-- ----------------------------------------------------------------------------
INSERT INTO "role_feature" ("id", "company_id", "role_id", "feature_id", "is_enabled", "created_at", "updated_at")
SELECT gen_random_uuid(), r.company_id, r.id, f.id, true, now(), now()
FROM "role" r
CROSS JOIN "feature" f
WHERE f.code = 'FORM_MANAGEMENT'
  AND r.role_type IN ('OWNER', 'ADMIN', 'MEMBER')
  AND r.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "role_feature" rf WHERE rf.role_id = r.id AND rf.feature_id = f.id
  );

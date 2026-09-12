-- Built-in system catalog snapshot. Keep existing IDs and feature enablement.
-- Catalog only: tenant entitlements and role assignments are managed separately.
INSERT INTO "feature" ("id", "code", "name", "description", "category", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'ATTENDANCE_MANAGEMENT', 'Attendance Management', 'Attendance logs and check-in schedules', 'HR', true, now(), now()),
  (gen_random_uuid(), 'LEAVE_MANAGEMENT', 'Leave Management', 'Leave types, quotas and requests', 'HR', true, now(), now()),
  (gen_random_uuid(), 'COMPANY_MANAGEMENT', 'Company Management', 'Companies and branches', 'ORGANIZATION', true, now(), now()),
  (gen_random_uuid(), 'ROLE_PERMISSION_MANAGEMENT', 'Access Control & Roles', 'Roles, permissions and feature access', 'SECURITY', true, now(), now()),
  (gen_random_uuid(), 'EMPLOYEE_MANAGEMENT', 'Employee Directory', 'Users and company members', 'HR', true, now(), now()),
  (gen_random_uuid(), 'FORM_MANAGEMENT', 'Form Management', 'Form templates, submissions and reviews', 'OPERATIONS', true, now(), now())
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "category" = EXCLUDED."category",
  "updated_at" = now();

--> statement-breakpoint

INSERT INTO "permission" ("id", "action", "module", "description", "feature_id", "created_at", "updated_at")
SELECT gen_random_uuid(), v.action, v.module, v.description, f.id, now(), now()
FROM (VALUES
  ('attendance:check_in', 'attendance', 'attendance check in', 'ATTENDANCE_MANAGEMENT'),
  ('attendance:manage', 'attendance', 'attendance manage', 'ATTENDANCE_MANAGEMENT'),
  ('attendance:read', 'attendance', 'attendance read', 'ATTENDANCE_MANAGEMENT'),
  ('attendance_schedule:manage', 'attendance_schedule', 'attendance schedule manage', 'ATTENDANCE_MANAGEMENT'),
  ('attendance_schedule:read', 'attendance_schedule', 'attendance schedule read', 'ATTENDANCE_MANAGEMENT'),
  ('company:create', 'company', 'company create', 'COMPANY_MANAGEMENT'),
  ('company:delete', 'company', 'company delete', 'COMPANY_MANAGEMENT'),
  ('company:read', 'company', 'company read', 'COMPANY_MANAGEMENT'),
  ('company:update', 'company', 'company update', 'COMPANY_MANAGEMENT'),
  ('company_branch:create', 'company_branch', 'company branch create', 'COMPANY_MANAGEMENT'),
  ('company_branch:delete', 'company_branch', 'company branch delete', 'COMPANY_MANAGEMENT'),
  ('company_branch:read', 'company_branch', 'company branch read', 'COMPANY_MANAGEMENT'),
  ('company_branch:update', 'company_branch', 'company branch update', 'COMPANY_MANAGEMENT'),
  ('company_feature:create', 'company_feature', 'company feature create', 'ROLE_PERMISSION_MANAGEMENT'),
  ('company_feature:delete', 'company_feature', 'company feature delete', 'ROLE_PERMISSION_MANAGEMENT'),
  ('company_feature:read', 'company_feature', 'company feature read', 'ROLE_PERMISSION_MANAGEMENT'),
  ('company_feature:toggle', 'company_feature', 'company feature toggle', 'ROLE_PERMISSION_MANAGEMENT'),
  ('company_member:create', 'company_member', 'company member create', 'EMPLOYEE_MANAGEMENT'),
  ('company_member:delete', 'company_member', 'company member delete', 'EMPLOYEE_MANAGEMENT'),
  ('company_member:read', 'company_member', 'company member read', 'EMPLOYEE_MANAGEMENT'),
  ('company_member:update', 'company_member', 'company member update', 'EMPLOYEE_MANAGEMENT'),
  ('feature:create', 'feature', 'feature create', 'ROLE_PERMISSION_MANAGEMENT'),
  ('feature:read', 'feature', 'feature read', 'ROLE_PERMISSION_MANAGEMENT'),
  ('feature:toggle', 'feature', 'feature toggle', 'ROLE_PERMISSION_MANAGEMENT'),
  ('feature:update', 'feature', 'feature update', 'ROLE_PERMISSION_MANAGEMENT'),
  ('form_submission:create', 'form_submission', 'form submission create', 'FORM_MANAGEMENT'),
  ('form_submission:read', 'form_submission', 'form submission read', 'FORM_MANAGEMENT'),
  ('form_submission:review', 'form_submission', 'form submission review', 'FORM_MANAGEMENT'),
  ('form_submission:submit', 'form_submission', 'form submission submit', 'FORM_MANAGEMENT'),
  ('form_submission:update', 'form_submission', 'form submission update', 'FORM_MANAGEMENT'),
  ('form_template:create', 'form_template', 'form template create', 'FORM_MANAGEMENT'),
  ('form_template:publish', 'form_template', 'form template publish', 'FORM_MANAGEMENT'),
  ('form_template:read', 'form_template', 'form template read', 'FORM_MANAGEMENT'),
  ('form_template:update', 'form_template', 'form template update', 'FORM_MANAGEMENT'),
  ('leave_quota:manage', 'leave', 'leave quota manage', 'LEAVE_MANAGEMENT'),
  ('leave_quota:read', 'leave', 'leave quota read', 'LEAVE_MANAGEMENT'),
  ('leave_request:approve', 'leave', 'leave request approve', 'LEAVE_MANAGEMENT'),
  ('leave_request:cancel', 'leave', 'leave request cancel', 'LEAVE_MANAGEMENT'),
  ('leave_request:create', 'leave', 'leave request create', 'LEAVE_MANAGEMENT'),
  ('leave_request:read', 'leave', 'leave request read', 'LEAVE_MANAGEMENT'),
  ('leave_type:manage', 'leave', 'leave type manage', 'LEAVE_MANAGEMENT'),
  ('leave_type:read', 'leave', 'leave type read', 'LEAVE_MANAGEMENT'),
  ('permission:assign', 'permission', 'permission assign', 'ROLE_PERMISSION_MANAGEMENT'),
  ('permission:create', 'permission', 'permission create', 'ROLE_PERMISSION_MANAGEMENT'),
  ('permission:delete', 'permission', 'permission delete', 'ROLE_PERMISSION_MANAGEMENT'),
  ('permission:read', 'permission', 'permission read', 'ROLE_PERMISSION_MANAGEMENT'),
  ('permission:revoke', 'permission', 'permission revoke', 'ROLE_PERMISSION_MANAGEMENT'),
  ('permission:update', 'permission', 'permission update', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role:create', 'role', 'role create', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role:delete', 'role', 'role delete', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role:read', 'role', 'role read', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role:update', 'role', 'role update', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role_feature:check', 'role_feature', 'role feature check', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role_feature:create', 'role_feature', 'role feature create', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role_feature:delete', 'role_feature', 'role feature delete', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role_feature:read', 'role_feature', 'role feature read', 'ROLE_PERMISSION_MANAGEMENT'),
  ('role_feature:toggle', 'role_feature', 'role feature toggle', 'ROLE_PERMISSION_MANAGEMENT'),
  ('user:create', 'user', 'user create', 'EMPLOYEE_MANAGEMENT'),
  ('user:delete', 'user', 'user delete', 'EMPLOYEE_MANAGEMENT'),
  ('user:read', 'user', 'user read', 'EMPLOYEE_MANAGEMENT'),
  ('user:update', 'user', 'user update', 'EMPLOYEE_MANAGEMENT')
) AS v(action, module, description, feature_code)
JOIN "feature" f ON f.code = v.feature_code
ON CONFLICT ("action") DO UPDATE SET
  "module" = EXCLUDED."module",
  "description" = EXCLUDED."description",
  "feature_id" = EXCLUDED."feature_id",
  "updated_at" = now();

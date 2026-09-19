-- ============================================================================
-- Migration: 20260919142000_alter_add_soft_delete
-- Description: Add deleted_at column, indexes, and partial unique indexes
--              to support soft delete across database entities.
-- ============================================================================

-- 1. Add deleted_at columns
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "company_branch" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "company_member" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "leave_types" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "role_permission" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "feature" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "company_feature" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "role_feature" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_template" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_version" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_section" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_field" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_plan" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_submission" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint

-- 2. Convert unique constraints to partial unique indexes (active records only)
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_email_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "user" ("email") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "company_slug_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "company_slug_unique" ON "company" ("slug") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "leave_types" DROP CONSTRAINT IF EXISTS "leave_type_company_name_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "leave_type_company_name_unique" ON "leave_types" ("company_id", "name") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "leave_quotas" DROP CONSTRAINT IF EXISTS "leave_quota_member_type_year_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "leave_quota_member_type_year_unique" ON "leave_quotas" ("company_member_id", "leave_type_id", "year") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "attendance_logs" DROP CONSTRAINT IF EXISTS "attendance_log_unique_per_slot_per_day";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "attendance_log_unique_per_slot_per_day" ON "attendance_logs" ("company_member_id", "schedule_slot_id", "work_date") WHERE "deleted_at" IS NULL;
--> statement-breakpoint

-- 3. Add indexes on deleted_at columns for query performance
CREATE INDEX IF NOT EXISTS "user_deleted_at_idx" ON "user" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_deleted_at_idx" ON "company" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_branch_deleted_at_idx" ON "company_branch" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_member_deleted_at_idx" ON "company_member" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_deleted_at_idx" ON "locations" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "check_in_schedule_deleted_at_idx" ON "check_in_schedules" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schedule_slots_deleted_at_idx" ON "schedule_slots" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attendance_log_deleted_at_idx" ON "attendance_logs" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_type_deleted_at_idx" ON "leave_types" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_quota_deleted_at_idx" ON "leave_quotas" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leave_request_deleted_at_idx" ON "leave_requests" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_deleted_at_idx" ON "role" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "permission_deleted_at_idx" ON "permission" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permission_deleted_at_idx" ON "role_permission" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_deleted_at_idx" ON "feature" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_feature_deleted_at_idx" ON "company_feature" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_feature_deleted_at_idx" ON "role_feature" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_template_deleted_at_idx" ON "form_template" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_version_deleted_at_idx" ON "form_version" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_section_deleted_at_idx" ON "form_section" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_field_deleted_at_idx" ON "form_field" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_plan_deleted_at_idx" ON "form_plan" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_submission_deleted_at_idx" ON "form_submission" ("deleted_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "form_answer_attachment_deleted_at_idx" ON "form_answer_attachment" ("deleted_at");

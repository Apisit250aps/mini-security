CREATE TYPE "role_type" AS ENUM('SUPER_ADMIN', 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER');--> statement-breakpoint
CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "leave_unit" AS ENUM('day', 'half_day', 'hour');--> statement-breakpoint
CREATE TYPE "form_field_type" AS ENUM('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE');--> statement-breakpoint
CREATE TYPE "form_submission_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "form_version_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "submission_review_action" AS ENUM('APPROVE', 'REJECT');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"issuer" text,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" uuid PRIMARY KEY,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"alg" text,
	"crv" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"active_company_id" uuid,
	"permissions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_branch" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_member" (
	"id" uuid PRIMARY KEY,
	"company_branch_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" uuid PRIMARY KEY,
	"feature_id" uuid,
	"action" text NOT NULL UNIQUE,
	"module" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"role_type" "role_type" DEFAULT 'MEMBER'::"role_type" NOT NULL,
	"is_system_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"id" uuid PRIMARY KEY,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_feature" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"assigned_by" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "company_feature_company_feature_unique" UNIQUE("company_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" uuid PRIMARY KEY,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_feature" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "role_feature_role_feature_unique" UNIQUE("role_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "attendance_logs" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"schedule_slot_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"checked_in_at" timestamp,
	"status" "attendance_status" DEFAULT 'absent'::"attendance_status" NOT NULL,
	"note" text,
	"recorded_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "attendance_log_unique_per_slot_per_day" UNIQUE("company_member_id","schedule_slot_id","work_date")
);
--> statement-breakpoint
CREATE TABLE "check_in_schedule_roles" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"check_in_schedule_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "check_in_schedule_role_pair_unique" UNIQUE("check_in_schedule_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "check_in_schedules" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "check_in_schedule_id_company_unique" UNIQUE("id","company_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" uuid PRIMARY KEY,
	"check_in_schedule_id" uuid NOT NULL,
	"slot_order" integer NOT NULL,
	"label" text NOT NULL,
	"window_start" time NOT NULL,
	"window_end" time NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "schedule_slot_order_unique" UNIQUE("check_in_schedule_id","slot_order")
);
--> statement-breakpoint
CREATE TABLE "leave_quotas" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"total_days" numeric(5,2) NOT NULL,
	"used_days" numeric(5,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "leave_quota_member_type_year_unique" UNIQUE("company_member_id","leave_type_id","year")
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" numeric(5,2) NOT NULL,
	"unit" "leave_unit" DEFAULT 'day'::"leave_unit" NOT NULL,
	"reason" text NOT NULL,
	"proof_url" text,
	"status" "leave_request_status" DEFAULT 'pending'::"leave_request_status" NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_types" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"unit" "leave_unit" DEFAULT 'day'::"leave_unit" NOT NULL,
	"requires_proof" boolean DEFAULT false NOT NULL,
	"max_days_per_year" integer,
	"is_paid" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "leave_type_company_name_unique" UNIQUE("company_id","name")
);
--> statement-breakpoint
CREATE TABLE "form_answer" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_answer_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_answer_submission_field_unique" UNIQUE("submission_id","field_id")
);
--> statement-breakpoint
CREATE TABLE "form_answer_attachment" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_answer_attachment_answer_key_unique" UNIQUE("answer_id","storage_key")
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"form_section_id" uuid NOT NULL,
	"type" "form_field_type" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_field_id_company_version_unique" UNIQUE("id","company_id","form_version_id")
);
--> statement-breakpoint
CREATE TABLE "form_section" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_section_id_company_version_unique" UNIQUE("id","company_id","form_version_id")
);
--> statement-breakpoint
CREATE TABLE "form_submission" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"started_by" uuid NOT NULL,
	"submitted_by" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"supersedes_submission_id" uuid CONSTRAINT "form_submission_supersedes_submission_id_unique" UNIQUE,
	"status" "form_submission_status" DEFAULT 'DRAFT'::"form_submission_status" NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_submission_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_submission_id_company_version_role_unique" UNIQUE("id","company_id","form_version_id","role_id"),
	CONSTRAINT "form_submission_id_company_unique" UNIQUE("id","company_id")
);
--> statement-breakpoint
CREATE TABLE "form_submission_contributor" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_submission_contributor_submission_member_unique" UNIQUE("submission_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "form_template" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_template_id_company_id_unique" UNIQUE("id","company_id")
);
--> statement-breakpoint
CREATE TABLE "form_template_role" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_template_role_template_role_unique" UNIQUE("form_template_id","role_id"),
	CONSTRAINT "form_template_role_template_company_role_unique" UNIQUE("form_template_id","company_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "form_version" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"status" "form_version_status" DEFAULT 'DRAFT'::"form_version_status" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_by" uuid NOT NULL,
	"published_by" uuid,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_version_id_company_id_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_version_id_company_template_unique" UNIQUE("id","company_id","form_template_id"),
	CONSTRAINT "form_version_template_version_unique" UNIQUE("form_template_id","version")
);
--> statement-breakpoint
CREATE TABLE "submission_review" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL CONSTRAINT "submission_review_submission_id_unique" UNIQUE,
	"reviewed_by" uuid NOT NULL,
	"action" "submission_review_action" NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" ("email");--> statement-breakpoint
CREATE INDEX "user_is_admin_idx" ON "user" ("is_admin");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "company" ("slug");--> statement-breakpoint
CREATE INDEX "company_branch_company_id_idx" ON "company_branch" ("company_id");--> statement-breakpoint
CREATE INDEX "company_member_company_branch_id_idx" ON "company_member" ("company_branch_id");--> statement-breakpoint
CREATE INDEX "company_member_company_id_idx" ON "company_member" ("company_id");--> statement-breakpoint
CREATE INDEX "company_member_user_id_idx" ON "company_member" ("user_id");--> statement-breakpoint
CREATE INDEX "company_member_role_id_idx" ON "company_member" ("role_id");--> statement-breakpoint
CREATE INDEX "company_member_company_user_idx" ON "company_member" ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "permission_action_idx" ON "permission" ("action");--> statement-breakpoint
CREATE INDEX "permission_module_idx" ON "permission" ("module");--> statement-breakpoint
CREATE INDEX "permission_feature_id_idx" ON "permission" ("feature_id");--> statement-breakpoint
CREATE INDEX "role_company_id_idx" ON "role" ("company_id");--> statement-breakpoint
CREATE INDEX "role_is_system_default_idx" ON "role" ("is_system_default");--> statement-breakpoint
CREATE INDEX "role_role_type_idx" ON "role" ("role_type");--> statement-breakpoint
CREATE INDEX "role_permission_role_id_idx" ON "role_permission" ("role_id");--> statement-breakpoint
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission" ("permission_id");--> statement-breakpoint
CREATE INDEX "role_permission_unique_idx" ON "role_permission" ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "company_feature_company_id_idx" ON "company_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "company_feature_feature_id_idx" ON "company_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "company_feature_is_enabled_idx" ON "company_feature" ("is_enabled");--> statement-breakpoint
CREATE INDEX "feature_code_idx" ON "feature" ("code");--> statement-breakpoint
CREATE INDEX "feature_category_idx" ON "feature" ("category");--> statement-breakpoint
CREATE INDEX "feature_is_active_idx" ON "feature" ("is_active");--> statement-breakpoint
CREATE INDEX "role_feature_company_id_idx" ON "role_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "role_feature_role_id_idx" ON "role_feature" ("role_id");--> statement-breakpoint
CREATE INDEX "role_feature_feature_id_idx" ON "role_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "attendance_log_member_id_idx" ON "attendance_logs" ("company_member_id");--> statement-breakpoint
CREATE INDEX "attendance_log_slot_id_idx" ON "attendance_logs" ("schedule_slot_id");--> statement-breakpoint
CREATE INDEX "attendance_log_work_date_idx" ON "attendance_logs" ("work_date");--> statement-breakpoint
CREATE INDEX "check_in_schedule_role_company_role_idx" ON "check_in_schedule_roles" ("company_id","role_id");--> statement-breakpoint
CREATE INDEX "check_in_schedule_company_id_idx" ON "check_in_schedules" ("company_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_schedule_id_idx" ON "schedule_slots" ("check_in_schedule_id");--> statement-breakpoint
CREATE INDEX "leave_quota_member_id_idx" ON "leave_quotas" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_quota_type_id_idx" ON "leave_quotas" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_member_id_idx" ON "leave_requests" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_request_type_id_idx" ON "leave_requests" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_requests" ("status");--> statement-breakpoint
CREATE INDEX "leave_request_member_date_idx" ON "leave_requests" ("company_member_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "leave_type_company_id_idx" ON "leave_types" ("company_id");--> statement-breakpoint
CREATE INDEX "form_answer_company_field_idx" ON "form_answer" ("company_id","field_id");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_answer_sort_idx" ON "form_answer_attachment" ("answer_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_company_key_idx" ON "form_answer_attachment" ("company_id","storage_key");--> statement-breakpoint
CREATE INDEX "form_field_section_sort_idx" ON "form_field" ("form_section_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_section_version_sort_idx" ON "form_section" ("form_version_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_submission_company_status_submitted_idx" ON "form_submission" ("company_id","status","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_role_template_status_idx" ON "form_submission" ("company_id","role_id","form_template_id","status");--> statement-breakpoint
CREATE INDEX "form_submission_company_started_by_created_idx" ON "form_submission" ("company_id","started_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_submitted_by_created_idx" ON "form_submission" ("company_id","submitted_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_form_version_id_idx" ON "form_submission" ("form_version_id");--> statement-breakpoint
CREATE INDEX "form_submission_contributor_company_member_idx" ON "form_submission_contributor" ("company_id","member_id");--> statement-breakpoint
CREATE INDEX "form_template_company_id_is_active_idx" ON "form_template" ("company_id","is_active");--> statement-breakpoint
CREATE INDEX "form_template_role_company_role_idx" ON "form_template_role" ("company_id","role_id");--> statement-breakpoint
CREATE INDEX "form_version_company_status_idx" ON "form_version" ("company_id","status");--> statement-breakpoint
CREATE INDEX "submission_review_company_reviewer_created_idx" ON "submission_review" ("company_id","reviewed_by","created_at");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_branch" ADD CONSTRAINT "company_branch_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_branch_id_company_branch_id_fkey" FOREIGN KEY ("company_branch_id") REFERENCES "company_branch"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_schedule_slot_id_schedule_slots_id_fkey" FOREIGN KEY ("schedule_slot_id") REFERENCES "schedule_slots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_6pkuxLN7igmX_fkey" FOREIGN KEY ("check_in_schedule_id","company_id") REFERENCES "check_in_schedules"("id","company_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedules_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_check_in_schedule_id_check_in_schedules_id_fkey" FOREIGN KEY ("check_in_schedule_id") REFERENCES "check_in_schedules"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_form_version_id_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_submission_id_form_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_field_id_form_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "form_field"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_updated_by_company_member_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_answer_id_form_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "form_answer"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_uploaded_by_company_member_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_version_id_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_section_id_form_section_id_fkey" FOREIGN KEY ("form_section_id") REFERENCES "form_section"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_form_version_id_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_template_id_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_version_id_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_started_by_company_member_id_fkey" FOREIGN KEY ("started_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submitted_by_company_member_id_fkey" FOREIGN KEY ("submitted_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_GA6fbriijyrK_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_member_id_company_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_created_by_company_member_id_fkey" FOREIGN KEY ("created_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_form_template_id_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_form_template_id_form_template_id_fkey" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_created_by_company_member_id_fkey" FOREIGN KEY ("created_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_published_by_company_member_id_fkey" FOREIGN KEY ("published_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_submission_id_form_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_reviewed_by_company_member_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "company_member"("id") ON DELETE RESTRICT;
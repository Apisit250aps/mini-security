CREATE TYPE "role_type" AS ENUM('SUPER_ADMIN', 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER');--> statement-breakpoint
CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "leave_unit" AS ENUM('day', 'half_day', 'hour');--> statement-breakpoint
CREATE TYPE "form_field_type" AS ENUM('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'RADIO', 'CHECKBOX_GROUP', 'BOOLEAN', 'DATE', 'EMAIL', 'IMAGE', 'FILE');--> statement-breakpoint
CREATE TYPE "form_late_policy" AS ENUM('ALLOW', 'DENY');--> statement-breakpoint
CREATE TYPE "form_missed_policy" AS ENUM('SKIP', 'CATCH_UP');--> statement-breakpoint
CREATE TYPE "form_review_action" AS ENUM('PASS', 'NEEDS_CHANGES', 'APPROVE', 'RETURN');--> statement-breakpoint
CREATE TYPE "form_review_mode" AS ENUM('NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS');--> statement-breakpoint
CREATE TYPE "form_role_distribution" AS ENUM('SHARED', 'PER_MEMBER');--> statement-breakpoint
CREATE TYPE "form_schedule_kind" AS ENUM('RECURRING', 'EXPLICIT');--> statement-breakpoint
CREATE TYPE "form_version_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
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
	"slug" text NOT NULL,
	"logo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "company_branch" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "company_branch_id_company_id_unique" UNIQUE("id","company_id")
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
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "company_member_id_company_unique" UNIQUE("id","company_id")
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" uuid PRIMARY KEY,
	"feature_id" uuid,
	"action" text NOT NULL UNIQUE,
	"module" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
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
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"id" uuid PRIMARY KEY,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "role_permission_unique_idx" UNIQUE("role_id","permission_id")
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
	"deleted_at" timestamp,
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
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
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
	"deleted_at" timestamp,
	CONSTRAINT "role_feature_role_feature_unique" UNIQUE("role_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"company_branch_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"radius_meters" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "locations_id_company_id_unique" UNIQUE("id","company_id"),
	CONSTRAINT "location_radius_meters_check" CHECK (radius_meters > 0 AND radius_meters < 'Infinity'::float8),
	CONSTRAINT "location_primary_active_check" CHECK (NOT is_primary OR is_active)
);
--> statement-breakpoint
CREATE TABLE "attendance_logs" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"company_member_id" uuid NOT NULL,
	"schedule_slot_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"checked_in_at" timestamp,
	"status" "attendance_status" DEFAULT 'absent'::"attendance_status" NOT NULL,
	"note" text,
	"recorded_by" uuid,
	"location_id" uuid,
	"checked_in_latitude" text,
	"checked_in_longitude" text,
	"location_name_snapshot" text,
	"location_latitude_snapshot" text,
	"location_longitude_snapshot" text,
	"radius_meters_snapshot" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "attendance_log_radius_meters_check" CHECK (radius_meters_snapshot > 0 AND radius_meters_snapshot < 'Infinity'::float8),
	CONSTRAINT "attendance_location_snapshot_complete_check" CHECK (num_nonnulls(location_id, checked_in_latitude, checked_in_longitude, location_name_snapshot, location_latitude_snapshot, location_longitude_snapshot, radius_meters_snapshot) IN (0, 7)),
	CONSTRAINT "attendance_location_event_check" CHECK (location_id IS NULL OR (checked_in_at IS NOT NULL AND status IN ('present', 'late')))
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
	"deleted_at" timestamp,
	CONSTRAINT "check_in_schedule_id_company_unique" UNIQUE("id","company_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_slot_location" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"schedule_slot_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "schedule_slot_location_slot_loc_unique" UNIQUE("schedule_slot_id","location_id"),
	CONSTRAINT "schedule_slot_location_slot_loc_company_unique" UNIQUE("schedule_slot_id","location_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"check_in_schedule_id" uuid NOT NULL,
	"slot_order" integer NOT NULL,
	"label" text NOT NULL,
	"window_start" time NOT NULL,
	"window_end" time NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "schedule_slots_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "schedule_slot_order_unique" UNIQUE("check_in_schedule_id","slot_order")
);
--> statement-breakpoint
CREATE TABLE "leave_quotas" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"total_days" numeric(5,2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "leave_quota_total_days_check" CHECK (total_days >= 0)
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"minutes_per_day_snapshot" integer,
	"unit" "leave_unit" DEFAULT 'day'::"leave_unit" NOT NULL,
	"reason" text NOT NULL,
	"proof_url" text,
	"status" "leave_request_status" DEFAULT 'pending'::"leave_request_status" NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "leave_request_date_order_check" CHECK (end_date >= start_date),
	CONSTRAINT "leave_request_source_interval_check" CHECK (((unit IN ('day', 'half_day') AND start_time IS NULL AND end_time IS NULL AND minutes_per_day_snapshot IS NULL) OR (unit = 'hour' AND start_date = end_date AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time AND minutes_per_day_snapshot IS NOT NULL AND minutes_per_day_snapshot > 0)))
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
	"deleted_at" timestamp
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
	CONSTRAINT "form_answer_id_company_submission_unique" UNIQUE("id","company_id","submission_id"),
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
	"deleted_at" timestamp,
	CONSTRAINT "form_answer_attachment_answer_key_unique" UNIQUE("answer_id","storage_key"),
	CONSTRAINT "form_answer_attachment_size_check" CHECK (size_bytes > 0),
	CONSTRAINT "form_answer_attachment_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_assignment" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"role_id" uuid,
	"company_member_id" uuid,
	"replaces_assignment_id" uuid CONSTRAINT "form_assignment_replaces_assignment_id_unique" UNIQUE,
	"assigned_by" uuid,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_assignment_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_assignment_id_company_occurrence_unique" UNIQUE("id","company_id","occurrence_id"),
	CONSTRAINT "form_assignment_target_check" CHECK (num_nonnulls(role_id, company_member_id) = 1),
	CONSTRAINT "form_assignment_no_self_check" CHECK (replaces_assignment_id IS NULL OR replaces_assignment_id <> id),
	CONSTRAINT "form_assignment_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0))
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"form_section_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"type" "form_field_type" NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"min" double precision,
	"max" double precision,
	"min_length" integer,
	"max_length" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_field_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_field_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_field_option" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_field_option_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_field_option_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_occurrence" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"period_id" uuid,
	"occurrence_key" text NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_occurrence_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_occurrence_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_occurrence_plan_key_unique" UNIQUE("plan_id","occurrence_key"),
	CONSTRAINT "form_occurrence_plan_period_unique" UNIQUE("plan_id","period_id"),
	CONSTRAINT "form_occurrence_time_check" CHECK (due_at > opens_at),
	CONSTRAINT "form_occurrence_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0))
);
--> statement-breakpoint
CREATE TABLE "form_plan" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"supersedes_plan_id" uuid CONSTRAINT "form_plan_supersedes_plan_id_unique" UNIQUE,
	"name" text NOT NULL,
	"schedule_kind" "form_schedule_kind" NOT NULL,
	"schedule_config" jsonb,
	"timezone" text NOT NULL,
	"fixed_version_id" uuid,
	"review_mode" "form_review_mode" DEFAULT 'OVERALL'::"form_review_mode" NOT NULL,
	"late_policy" "form_late_policy" DEFAULT 'DENY'::"form_late_policy" NOT NULL,
	"missed_policy" "form_missed_policy" DEFAULT 'SKIP'::"form_missed_policy" NOT NULL,
	"effective_from" timestamp with time zone,
	"effective_until" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"closed_by" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_plan_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_plan_id_company_template_unique" UNIQUE("id","company_id","form_template_id"),
	CONSTRAINT "form_plan_schedule_check" CHECK ((schedule_kind = 'RECURRING' AND schedule_config IS NOT NULL AND jsonb_typeof(schedule_config) = 'object') OR (schedule_kind = 'EXPLICIT' AND schedule_config IS NULL)),
	CONSTRAINT "form_plan_effective_check" CHECK (effective_until IS NULL OR (effective_from IS NOT NULL AND effective_until > effective_from)),
	CONSTRAINT "form_plan_no_self_check" CHECK (supersedes_plan_id IS NULL OR supersedes_plan_id <> id),
	CONSTRAINT "form_plan_closed_actor_check" CHECK (closed_by IS NULL OR effective_until IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "form_plan_period" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_plan_period_id_company_plan_unique" UNIQUE("id","company_id","plan_id"),
	CONSTRAINT "form_plan_period_plan_opens_due_unique" UNIQUE("plan_id","opens_at","due_at"),
	CONSTRAINT "form_plan_period_time_check" CHECK (due_at > opens_at)
);
--> statement-breakpoint
CREATE TABLE "form_plan_target" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"role_id" uuid,
	"company_member_id" uuid,
	"role_distribution" "form_role_distribution",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_plan_target_plan_role_unique" UNIQUE("plan_id","role_id"),
	CONSTRAINT "form_plan_target_plan_member_unique" UNIQUE("plan_id","company_member_id"),
	CONSTRAINT "form_plan_target_xor_check" CHECK ((role_id IS NOT NULL AND company_member_id IS NULL AND role_distribution IS NOT NULL) OR (role_id IS NULL AND company_member_id IS NOT NULL AND role_distribution IS NULL))
);
--> statement-breakpoint
CREATE TABLE "form_review_entry" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"answer_id" uuid,
	"section_id" uuid,
	"action" "form_review_action" NOT NULL,
	"note" text,
	"reviewed_by" uuid NOT NULL,
	"supersedes_entry_id" uuid CONSTRAINT "form_review_entry_supersedes_entry_id_unique" UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_review_entry_id_company_submission_unique" UNIQUE("id","company_id","submission_id"),
	CONSTRAINT "form_review_target_action_check" CHECK ((num_nonnulls(answer_id, section_id) = 1 AND action IN ('PASS', 'NEEDS_CHANGES')) OR (answer_id IS NULL AND section_id IS NULL AND action IN ('APPROVE', 'RETURN') AND supersedes_entry_id IS NULL)),
	CONSTRAINT "form_review_note_check" CHECK (action NOT IN ('NEEDS_CHANGES', 'RETURN') OR (note IS NOT NULL AND length(trim(note)) > 0)),
	CONSTRAINT "form_review_no_self_check" CHECK (supersedes_entry_id IS NULL OR supersedes_entry_id <> id)
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
	"deleted_at" timestamp,
	CONSTRAINT "form_section_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_section_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_submission" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"assignment_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"started_by" uuid NOT NULL,
	"submitted_by" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"supersedes_submission_id" uuid CONSTRAINT "form_submission_supersedes_submission_id_unique" UNIQUE,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_submission_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_submission_id_company_version_assignment_unique" UNIQUE("id","company_id","form_version_id","assignment_id"),
	CONSTRAINT "form_submission_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_submission_revision_check" CHECK (revision > 0),
	CONSTRAINT "form_submission_status_time_check" CHECK ((submitted_at IS NULL) = (submitted_by IS NULL)),
	CONSTRAINT "form_submission_time_order_check" CHECK (submitted_at IS NULL OR submitted_at >= created_at),
	CONSTRAINT "form_submission_no_self_revision_check" CHECK (supersedes_submission_id IS NULL OR supersedes_submission_id <> id)
);
--> statement-breakpoint
CREATE TABLE "form_submission_contributor" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
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
	"deleted_at" timestamp,
	CONSTRAINT "form_template_id_company_id_unique" UNIQUE("id","company_id")
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
	"published_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_version_id_company_id_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_version_id_company_template_unique" UNIQUE("id","company_id","form_template_id"),
	CONSTRAINT "form_version_template_version_unique" UNIQUE("form_template_id","version"),
	CONSTRAINT "form_version_publish_metadata_check" CHECK ((status = 'DRAFT' AND published_at IS NULL AND published_by IS NULL) OR (status IN ('PUBLISHED', 'ARCHIVED') AND published_at IS NOT NULL AND published_by IS NOT NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "user" ("email") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" ("email");--> statement-breakpoint
CREATE INDEX "user_is_admin_idx" ON "user" ("is_admin");--> statement-breakpoint
CREATE INDEX "user_deleted_at_idx" ON "user" ("deleted_at");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "company_slug_unique" ON "company" ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "company" ("slug");--> statement-breakpoint
CREATE INDEX "company_deleted_at_idx" ON "company" ("deleted_at");--> statement-breakpoint
CREATE INDEX "company_branch_company_id_idx" ON "company_branch" ("company_id");--> statement-breakpoint
CREATE INDEX "company_branch_deleted_at_idx" ON "company_branch" ("deleted_at");--> statement-breakpoint
CREATE INDEX "company_member_company_branch_id_idx" ON "company_member" ("company_branch_id");--> statement-breakpoint
CREATE INDEX "company_member_company_id_idx" ON "company_member" ("company_id");--> statement-breakpoint
CREATE INDEX "company_member_user_id_idx" ON "company_member" ("user_id");--> statement-breakpoint
CREATE INDEX "company_member_role_id_idx" ON "company_member" ("role_id");--> statement-breakpoint
CREATE INDEX "company_member_company_user_idx" ON "company_member" ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "company_member_deleted_at_idx" ON "company_member" ("deleted_at");--> statement-breakpoint
CREATE INDEX "permission_action_idx" ON "permission" ("action");--> statement-breakpoint
CREATE INDEX "permission_module_idx" ON "permission" ("module");--> statement-breakpoint
CREATE INDEX "permission_feature_id_idx" ON "permission" ("feature_id");--> statement-breakpoint
CREATE INDEX "permission_deleted_at_idx" ON "permission" ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_company_id_idx" ON "role" ("company_id");--> statement-breakpoint
CREATE INDEX "role_is_system_default_idx" ON "role" ("is_system_default");--> statement-breakpoint
CREATE INDEX "role_role_type_idx" ON "role" ("role_type");--> statement-breakpoint
CREATE INDEX "role_deleted_at_idx" ON "role" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "role_system_default_unique" ON "role" ("role_type") WHERE company_id IS NULL AND is_system_default = true;--> statement-breakpoint
CREATE INDEX "role_permission_role_id_idx" ON "role_permission" ("role_id");--> statement-breakpoint
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission" ("permission_id");--> statement-breakpoint
CREATE INDEX "role_permission_deleted_at_idx" ON "role_permission" ("deleted_at");--> statement-breakpoint
CREATE INDEX "company_feature_company_id_idx" ON "company_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "company_feature_feature_id_idx" ON "company_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "company_feature_is_enabled_idx" ON "company_feature" ("is_enabled");--> statement-breakpoint
CREATE INDEX "company_feature_deleted_at_idx" ON "company_feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "feature_code_idx" ON "feature" ("code");--> statement-breakpoint
CREATE INDEX "feature_category_idx" ON "feature" ("category");--> statement-breakpoint
CREATE INDEX "feature_is_active_idx" ON "feature" ("is_active");--> statement-breakpoint
CREATE INDEX "feature_deleted_at_idx" ON "feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_feature_company_id_idx" ON "role_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "role_feature_role_id_idx" ON "role_feature" ("role_id");--> statement-breakpoint
CREATE INDEX "role_feature_feature_id_idx" ON "role_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "role_feature_deleted_at_idx" ON "role_feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "locations_branch_company_idx" ON "locations" ("company_branch_id","company_id");--> statement-breakpoint
CREATE INDEX "locations_company_active_idx" ON "locations" ("company_id","is_active");--> statement-breakpoint
CREATE INDEX "locations_deleted_at_idx" ON "locations" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_one_primary_per_branch" ON "locations" ("company_branch_id") WHERE is_primary = true;--> statement-breakpoint
CREATE INDEX "attendance_log_member_id_idx" ON "attendance_logs" ("company_member_id");--> statement-breakpoint
CREATE INDEX "attendance_log_slot_id_idx" ON "attendance_logs" ("schedule_slot_id");--> statement-breakpoint
CREATE INDEX "attendance_log_work_date_idx" ON "attendance_logs" ("work_date");--> statement-breakpoint
CREATE INDEX "attendance_log_deleted_at_idx" ON "attendance_logs" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_log_unique_per_slot_per_day" ON "attendance_logs" ("company_member_id","schedule_slot_id","work_date") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "check_in_schedule_role_company_role_idx" ON "check_in_schedule_roles" ("company_id","role_id");--> statement-breakpoint
CREATE INDEX "check_in_schedule_company_id_idx" ON "check_in_schedules" ("company_id");--> statement-breakpoint
CREATE INDEX "check_in_schedule_deleted_at_idx" ON "check_in_schedules" ("deleted_at");--> statement-breakpoint
CREATE INDEX "schedule_slot_location_loc_company_idx" ON "schedule_slot_location" ("location_id","company_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_location_company_slot_active_idx" ON "schedule_slot_location" ("company_id","schedule_slot_id","is_active");--> statement-breakpoint
CREATE INDEX "schedule_slot_schedule_id_idx" ON "schedule_slots" ("check_in_schedule_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_deleted_at_idx" ON "schedule_slots" ("deleted_at");--> statement-breakpoint
CREATE INDEX "leave_quota_member_id_idx" ON "leave_quotas" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_quota_type_id_idx" ON "leave_quotas" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_quota_deleted_at_idx" ON "leave_quotas" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_quota_member_type_year_unique" ON "leave_quotas" ("company_member_id","leave_type_id","year") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "leave_request_member_id_idx" ON "leave_requests" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_request_type_id_idx" ON "leave_requests" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_requests" ("status");--> statement-breakpoint
CREATE INDEX "leave_request_deleted_at_idx" ON "leave_requests" ("deleted_at");--> statement-breakpoint
CREATE INDEX "leave_request_member_date_idx" ON "leave_requests" ("company_member_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "leave_type_company_id_idx" ON "leave_types" ("company_id");--> statement-breakpoint
CREATE INDEX "leave_type_deleted_at_idx" ON "leave_types" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_type_company_name_unique" ON "leave_types" ("company_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "form_answer_company_field_idx" ON "form_answer" ("company_id","field_id");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_answer_sort_idx" ON "form_answer_attachment" ("answer_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_company_key_idx" ON "form_answer_attachment" ("company_id","storage_key");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_deleted_at_idx" ON "form_answer_attachment" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_role_assignment" ON "form_assignment" ("occurrence_id","role_id") WHERE cancelled_at IS NULL AND role_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_member_assignment" ON "form_assignment" ("occurrence_id","company_member_id") WHERE cancelled_at IS NULL AND company_member_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "form_assignment_company_member_created_idx" ON "form_assignment" ("company_id","company_member_id","created_at");--> statement-breakpoint
CREATE INDEX "form_assignment_company_role_created_idx" ON "form_assignment" ("company_id","role_id","created_at");--> statement-breakpoint
CREATE INDEX "form_field_section_sort_idx" ON "form_field" ("form_section_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_field_deleted_at_idx" ON "form_field" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_field_option_field_sort_idx" ON "form_field_option" ("field_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_field_option_deleted_at_idx" ON "form_field_option" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_occurrence_company_opens_idx" ON "form_occurrence" ("company_id","opens_at");--> statement-breakpoint
CREATE INDEX "form_plan_deleted_at_idx" ON "form_plan" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_plan_company_effective_idx" ON "form_plan" ("company_id","effective_from","effective_until");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_answer_review_root" ON "form_review_entry" ("submission_id","answer_id") WHERE answer_id IS NOT NULL AND supersedes_entry_id IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_section_review_root" ON "form_review_entry" ("submission_id","section_id") WHERE section_id IS NOT NULL AND supersedes_entry_id IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_final_review" ON "form_review_entry" ("submission_id") WHERE answer_id IS NULL AND section_id IS NULL;--> statement-breakpoint
CREATE INDEX "form_review_entry_submission_answer_created_idx" ON "form_review_entry" ("submission_id","answer_id","created_at");--> statement-breakpoint
CREATE INDEX "form_review_entry_submission_section_created_idx" ON "form_review_entry" ("submission_id","section_id","created_at");--> statement-breakpoint
CREATE INDEX "form_review_entry_company_reviewer_created_idx" ON "form_review_entry" ("company_id","reviewed_by","created_at");--> statement-breakpoint
CREATE INDEX "form_section_version_sort_idx" ON "form_section" ("form_version_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_section_deleted_at_idx" ON "form_section" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_submission_deleted_at_idx" ON "form_submission" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_root_submission" ON "form_submission" ("assignment_id") WHERE supersedes_submission_id IS NULL;--> statement-breakpoint
CREATE INDEX "form_submission_company_submitted_idx" ON "form_submission" ("company_id","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_assignment_idx" ON "form_submission" ("company_id","assignment_id");--> statement-breakpoint
CREATE INDEX "form_submission_company_started_by_created_idx" ON "form_submission" ("company_id","started_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_submitted_by_created_idx" ON "form_submission" ("company_id","submitted_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_form_version_id_idx" ON "form_submission" ("form_version_id");--> statement-breakpoint
CREATE INDEX "form_submission_contributor_company_member_idx" ON "form_submission_contributor" ("company_id","member_id");--> statement-breakpoint
CREATE INDEX "form_template_company_id_is_active_idx" ON "form_template" ("company_id","is_active");--> statement-breakpoint
CREATE INDEX "form_template_deleted_at_idx" ON "form_template" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_version_deleted_at_idx" ON "form_version" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_draft_version" ON "form_version" ("form_template_id") WHERE status = 'DRAFT';--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_published_version" ON "form_version" ("form_template_id") WHERE status = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "form_version_company_status_idx" ON "form_version" ("company_id","status");--> statement-breakpoint
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
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_d3AWot64h46Q_fkey" FOREIGN KEY ("company_branch_id","company_id") REFERENCES "company_branch"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_1Kio5Fh7QLsT_fkey" FOREIGN KEY ("company_member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_c8yTIXXbjqRg_fkey" FOREIGN KEY ("schedule_slot_id","company_id") REFERENCES "schedule_slots"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_70hnccZwoMXO_fkey" FOREIGN KEY ("schedule_slot_id","location_id","company_id") REFERENCES "schedule_slot_location"("schedule_slot_id","location_id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_6pkuxLN7igmX_fkey" FOREIGN KEY ("check_in_schedule_id","company_id") REFERENCES "check_in_schedules"("id","company_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedules_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_aSeS7v7gTWE9_fkey" FOREIGN KEY ("schedule_slot_id","company_id") REFERENCES "schedule_slots"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_v3YGcGNq4CMn_fkey" FOREIGN KEY ("location_id","company_id") REFERENCES "locations"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_x9qeTgyHZzmY_fkey" FOREIGN KEY ("check_in_schedule_id","company_id") REFERENCES "check_in_schedules"("id","company_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_submission_fk" FOREIGN KEY ("submission_id","company_id","form_version_id") REFERENCES "form_submission"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_field_fk" FOREIGN KEY ("field_id","company_id","form_version_id") REFERENCES "form_field"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_updated_by_member_fk" FOREIGN KEY ("updated_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_answer_fk" FOREIGN KEY ("answer_id","company_id") REFERENCES "form_answer"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_uploaded_by_member_fk" FOREIGN KEY ("uploaded_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_occurrence_fk" FOREIGN KEY ("occurrence_id","company_id","form_version_id") REFERENCES "form_occurrence"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_company_member_fk" FOREIGN KEY ("company_member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_replaces_fk" FOREIGN KEY ("replaces_assignment_id","company_id","occurrence_id") REFERENCES "form_assignment"("id","company_id","occurrence_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_assigned_by_fk" FOREIGN KEY ("assigned_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_cancelled_by_fk" FOREIGN KEY ("cancelled_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_section_fk" FOREIGN KEY ("form_section_id","company_id","form_version_id") REFERENCES "form_section"("id","company_id","form_version_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_field_option" ADD CONSTRAINT "form_field_option_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field_option" ADD CONSTRAINT "form_field_option_form_field_fk" FOREIGN KEY ("field_id","company_id","form_version_id") REFERENCES "form_field"("id","company_id","form_version_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_plan_fk" FOREIGN KEY ("plan_id","company_id","form_template_id") REFERENCES "form_plan"("id","company_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_form_version_fk" FOREIGN KEY ("form_version_id","company_id","form_template_id") REFERENCES "form_version"("id","company_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_period_fk" FOREIGN KEY ("period_id","company_id","plan_id") REFERENCES "form_plan_period"("id","company_id","plan_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_cancelled_by_fk" FOREIGN KEY ("cancelled_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_form_template_fk" FOREIGN KEY ("form_template_id","company_id") REFERENCES "form_template"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_supersedes_plan_fk" FOREIGN KEY ("supersedes_plan_id","company_id","form_template_id") REFERENCES "form_plan"("id","company_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_fixed_version_fk" FOREIGN KEY ("fixed_version_id","company_id","form_template_id") REFERENCES "form_version"("id","company_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_created_by_fk" FOREIGN KEY ("created_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_closed_by_fk" FOREIGN KEY ("closed_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_plan_fk" FOREIGN KEY ("plan_id","company_id") REFERENCES "form_plan"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_plan_fk" FOREIGN KEY ("plan_id","company_id") REFERENCES "form_plan"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_company_member_fk" FOREIGN KEY ("company_member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_submission_fk" FOREIGN KEY ("submission_id","company_id","form_version_id") REFERENCES "form_submission"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_answer_fk" FOREIGN KEY ("answer_id","company_id","submission_id") REFERENCES "form_answer"("id","company_id","submission_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_section_fk" FOREIGN KEY ("section_id","company_id","form_version_id") REFERENCES "form_section"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_supersedes_fk" FOREIGN KEY ("supersedes_entry_id","company_id","submission_id") REFERENCES "form_review_entry"("id","company_id","submission_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_reviewed_by_member_fk" FOREIGN KEY ("reviewed_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_form_version_fk" FOREIGN KEY ("form_version_id","company_id") REFERENCES "form_version"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_assignment_fk" FOREIGN KEY ("assignment_id","company_id","form_version_id") REFERENCES "form_assignment"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_started_by_member_fk" FOREIGN KEY ("started_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submitted_by_member_fk" FOREIGN KEY ("submitted_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_supersedes_submission_fk" FOREIGN KEY ("supersedes_submission_id","company_id","form_version_id","assignment_id") REFERENCES "form_submission"("id","company_id","form_version_id","assignment_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_submission_fk" FOREIGN KEY ("submission_id","company_id") REFERENCES "form_submission"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_member_fk" FOREIGN KEY ("member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_created_by_company_member_fk" FOREIGN KEY ("created_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_form_template_fk" FOREIGN KEY ("form_template_id","company_id") REFERENCES "form_template"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_created_by_company_member_fk" FOREIGN KEY ("created_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_published_by_company_member_fk" FOREIGN KEY ("published_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;
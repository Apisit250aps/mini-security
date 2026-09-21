CREATE TYPE "role_type" AS ENUM('SUPER_ADMIN', 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER');--> statement-breakpoint
CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "leave_unit" AS ENUM('day', 'half_day', 'hour');--> statement-breakpoint
CREATE TYPE "form_field_type" AS ENUM('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'RADIO', 'CHECKBOX_GROUP', 'BOOLEAN', 'DATE', 'EMAIL', 'IMAGE', 'FILE');--> statement-breakpoint
CREATE TYPE "form_late_policy" AS ENUM('ALLOW', 'DENY');--> statement-breakpoint
CREATE TYPE "form_missed_policy" AS ENUM('SKIP', 'CATCH_UP');--> statement-breakpoint
CREATE TYPE "form_review_action" AS ENUM('PASS', 'NEEDS_CHANGES', 'APPROVE', 'RETURN');--> statement-breakpoint
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
	"active_organization_id" uuid,
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
CREATE TABLE "organization" (
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
CREATE TABLE "organization_member" (
	"id" uuid PRIMARY KEY,
	"site_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "organization_member_id_organization_unique" UNIQUE("id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "site" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "site_id_organization_id_unique" UNIQUE("id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"role_type" "role_type" DEFAULT 'MEMBER'::"role_type" NOT NULL,
	"is_system_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
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
CREATE TABLE "organization_feature" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"assigned_by" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "organization_feature_organization_feature_unique" UNIQUE("organization_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "role_feature" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
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
	CONSTRAINT "locations_id_organization_id_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "location_radius_meters_check" CHECK (radius_meters > 0 AND radius_meters < 'Infinity'::float8),
	CONSTRAINT "location_primary_active_check" CHECK (NOT is_primary OR is_active)
);
--> statement-breakpoint
CREATE TABLE "attendance_logs" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"organization_member_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "check_in_schedule_id_organization_unique" UNIQUE("id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_slot_location" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"schedule_slot_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "schedule_slot_location_slot_loc_unique" UNIQUE("schedule_slot_id","location_id"),
	CONSTRAINT "schedule_slot_location_slot_loc_organization_unique" UNIQUE("schedule_slot_id","location_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "schedule_slots" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"check_in_schedule_id" uuid NOT NULL,
	"slot_order" integer NOT NULL,
	"label" text NOT NULL,
	"window_start" time NOT NULL,
	"window_end" time NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "schedule_slots_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "schedule_slot_order_unique" UNIQUE("check_in_schedule_id","slot_order")
);
--> statement-breakpoint
CREATE TABLE "leave_quotas" (
	"id" uuid PRIMARY KEY,
	"organization_member_id" uuid NOT NULL,
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
	"organization_member_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_answer_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "form_answer_id_organization_submission_unique" UNIQUE("id","organization_id","submission_id"),
	CONSTRAINT "form_answer_submission_field_unique" UNIQUE("submission_id","field_id")
);
--> statement-breakpoint
CREATE TABLE "form_answer_attachment" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	"organization_id" uuid NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"role_id" uuid,
	"organization_member_id" uuid,
	"replaces_assignment_id" uuid CONSTRAINT "form_assignment_replaces_assignment_id_unique" UNIQUE,
	"assigned_by" uuid,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_assignment_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_assignment_id_organization_occurrence_unique" UNIQUE("id","organization_id","occurrence_id"),
	CONSTRAINT "form_assignment_target_check" CHECK (num_nonnulls(role_id, organization_member_id) = 1),
	CONSTRAINT "form_assignment_no_self_check" CHECK (replaces_assignment_id IS NULL OR replaces_assignment_id <> id),
	CONSTRAINT "form_assignment_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0))
);
--> statement-breakpoint
CREATE TABLE "form_field" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	CONSTRAINT "form_field_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_field_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_field_option" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_field_option_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_field_option_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_occurrence" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	CONSTRAINT "form_occurrence_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "form_occurrence_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_occurrence_plan_key_unique" UNIQUE("plan_id","occurrence_key"),
	CONSTRAINT "form_occurrence_plan_period_unique" UNIQUE("plan_id","period_id"),
	CONSTRAINT "form_occurrence_time_check" CHECK (due_at > opens_at),
	CONSTRAINT "form_occurrence_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0))
);
--> statement-breakpoint
CREATE TABLE "form_plan" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"supersedes_plan_id" uuid CONSTRAINT "form_plan_supersedes_plan_id_unique" UNIQUE,
	"name" text NOT NULL,
	"schedule_kind" "form_schedule_kind" NOT NULL,
	"timezone" text NOT NULL,
	"fixed_version_id" uuid,
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
	CONSTRAINT "form_plan_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "form_plan_id_organization_template_unique" UNIQUE("id","organization_id","form_template_id"),
	CONSTRAINT "form_plan_effective_check" CHECK (effective_until IS NULL OR (effective_from IS NOT NULL AND effective_until > effective_from)),
	CONSTRAINT "form_plan_no_self_check" CHECK (supersedes_plan_id IS NULL OR supersedes_plan_id <> id),
	CONSTRAINT "form_plan_closed_actor_check" CHECK (closed_by IS NULL OR effective_until IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "form_plan_period" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_plan_period_id_organization_plan_unique" UNIQUE("id","organization_id","plan_id"),
	CONSTRAINT "form_plan_period_plan_opens_due_unique" UNIQUE("plan_id","opens_at","due_at"),
	CONSTRAINT "form_plan_period_time_check" CHECK (due_at > opens_at)
);
--> statement-breakpoint
CREATE TABLE "form_plan_recurring_schedule" (
	"plan_id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"frequency" text NOT NULL,
	"interval" integer NOT NULL,
	"anchor_local_date" date NOT NULL,
	"end_local_date" date,
	"open_local_time" text NOT NULL,
	"invalid_day_policy" text NOT NULL,
	"due_offset_amount" integer NOT NULL,
	"due_offset_unit" text NOT NULL,
	CONSTRAINT "form_schedule_frequency_check" CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
	CONSTRAINT "form_schedule_interval_check" CHECK (interval BETWEEN 1 AND 100),
	CONSTRAINT "form_schedule_range_check" CHECK (end_local_date IS NULL OR end_local_date >= anchor_local_date),
	CONSTRAINT "form_schedule_invalid_day_check" CHECK (invalid_day_policy IN ('SKIP', 'LAST_DAY')),
	CONSTRAINT "form_schedule_due_check" CHECK (due_offset_amount > 0 AND due_offset_unit IN ('ELAPSED_HOURS', 'CALENDAR_DAYS')),
	CONSTRAINT "form_schedule_time_check" CHECK (open_local_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);
--> statement-breakpoint
CREATE TABLE "form_plan_target" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"role_id" uuid,
	"organization_member_id" uuid,
	"role_distribution" "form_role_distribution",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_plan_target_plan_role_unique" UNIQUE("plan_id","role_id"),
	CONSTRAINT "form_plan_target_plan_member_unique" UNIQUE("plan_id","organization_member_id"),
	CONSTRAINT "form_plan_target_xor_check" CHECK ((role_id IS NOT NULL AND organization_member_id IS NULL AND role_distribution IS NOT NULL) OR (role_id IS NULL AND organization_member_id IS NOT NULL AND role_distribution IS NULL))
);
--> statement-breakpoint
CREATE TABLE "form_review_entry" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"answer_id" uuid NOT NULL,
	"action" "form_review_action" NOT NULL,
	"note" text,
	"reviewed_by" uuid NOT NULL,
	"supersedes_entry_id" uuid CONSTRAINT "form_review_entry_supersedes_entry_id_unique" UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_review_entry_id_organization_submission_unique" UNIQUE("id","organization_id","submission_id"),
	CONSTRAINT "form_review_target_action_check" CHECK (action IN ('PASS', 'NEEDS_CHANGES')),
	CONSTRAINT "form_review_note_check" CHECK (action NOT IN ('NEEDS_CHANGES', 'RETURN') OR (note IS NOT NULL AND length(trim(note)) > 0)),
	CONSTRAINT "form_review_no_self_check" CHECK (supersedes_entry_id IS NULL OR supersedes_entry_id <> id)
);
--> statement-breakpoint
CREATE TABLE "form_section" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_section_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_section_sort_order_check" CHECK (sort_order >= 0)
);
--> statement-breakpoint
CREATE TABLE "form_submission" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	CONSTRAINT "form_submission_id_organization_version_unique" UNIQUE("id","organization_id","form_version_id"),
	CONSTRAINT "form_submission_id_organization_version_assignment_unique" UNIQUE("id","organization_id","form_version_id","assignment_id"),
	CONSTRAINT "form_submission_id_organization_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "form_submission_revision_check" CHECK (revision > 0),
	CONSTRAINT "form_submission_status_time_check" CHECK ((submitted_at IS NULL) = (submitted_by IS NULL)),
	CONSTRAINT "form_submission_time_order_check" CHECK (submitted_at IS NULL OR submitted_at >= created_at),
	CONSTRAINT "form_submission_no_self_revision_check" CHECK (supersedes_submission_id IS NULL OR supersedes_submission_id <> id)
);
--> statement-breakpoint
CREATE TABLE "form_submission_contributor" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_submission_contributor_submission_member_unique" UNIQUE("submission_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "form_submission_decision" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL UNIQUE,
	"form_version_id" uuid NOT NULL,
	"action" text NOT NULL,
	"note" text,
	"decided_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "form_decision_action_check" CHECK (action IN ('APPROVE', 'RETURN')),
	CONSTRAINT "form_decision_note_check" CHECK (action <> 'RETURN' OR (note IS NOT NULL AND length(trim(note)) > 0))
);
--> statement-breakpoint
CREATE TABLE "form_template" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "form_template_id_organization_id_unique" UNIQUE("id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "form_version" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
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
	CONSTRAINT "form_version_id_organization_id_unique" UNIQUE("id","organization_id"),
	CONSTRAINT "form_version_id_organization_template_unique" UNIQUE("id","organization_id","form_template_id"),
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
CREATE UNIQUE INDEX "organization_slug_unique" ON "organization" ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "organization_slug_idx" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "organization_deleted_at_idx" ON "organization" ("deleted_at");--> statement-breakpoint
CREATE INDEX "organization_member_site_id_idx" ON "organization_member" ("site_id");--> statement-breakpoint
CREATE INDEX "organization_member_organization_id_idx" ON "organization_member" ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_member_user_id_idx" ON "organization_member" ("user_id");--> statement-breakpoint
CREATE INDEX "organization_member_role_id_idx" ON "organization_member" ("role_id");--> statement-breakpoint
CREATE INDEX "organization_member_organization_user_idx" ON "organization_member" ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_member_deleted_at_idx" ON "organization_member" ("deleted_at");--> statement-breakpoint
CREATE INDEX "site_organization_id_idx" ON "site" ("organization_id");--> statement-breakpoint
CREATE INDEX "site_deleted_at_idx" ON "site" ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_organization_id_idx" ON "role" ("organization_id");--> statement-breakpoint
CREATE INDEX "role_is_system_default_idx" ON "role" ("is_system_default");--> statement-breakpoint
CREATE INDEX "role_role_type_idx" ON "role" ("role_type");--> statement-breakpoint
CREATE INDEX "role_deleted_at_idx" ON "role" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "role_system_default_unique" ON "role" ("role_type") WHERE organization_id IS NULL AND is_system_default = true;--> statement-breakpoint
CREATE INDEX "permission_action_idx" ON "permission" ("action");--> statement-breakpoint
CREATE INDEX "permission_module_idx" ON "permission" ("module");--> statement-breakpoint
CREATE INDEX "permission_feature_id_idx" ON "permission" ("feature_id");--> statement-breakpoint
CREATE INDEX "permission_deleted_at_idx" ON "permission" ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_permission_role_id_idx" ON "role_permission" ("role_id");--> statement-breakpoint
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission" ("permission_id");--> statement-breakpoint
CREATE INDEX "role_permission_deleted_at_idx" ON "role_permission" ("deleted_at");--> statement-breakpoint
CREATE INDEX "feature_code_idx" ON "feature" ("code");--> statement-breakpoint
CREATE INDEX "feature_category_idx" ON "feature" ("category");--> statement-breakpoint
CREATE INDEX "feature_is_active_idx" ON "feature" ("is_active");--> statement-breakpoint
CREATE INDEX "feature_deleted_at_idx" ON "feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "organization_feature_organization_id_idx" ON "organization_feature" ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_feature_feature_id_idx" ON "organization_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "organization_feature_is_enabled_idx" ON "organization_feature" ("is_enabled");--> statement-breakpoint
CREATE INDEX "organization_feature_deleted_at_idx" ON "organization_feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_feature_organization_id_idx" ON "role_feature" ("organization_id");--> statement-breakpoint
CREATE INDEX "role_feature_role_id_idx" ON "role_feature" ("role_id");--> statement-breakpoint
CREATE INDEX "role_feature_feature_id_idx" ON "role_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "role_feature_deleted_at_idx" ON "role_feature" ("deleted_at");--> statement-breakpoint
CREATE INDEX "locations_site_organization_idx" ON "locations" ("site_id","organization_id");--> statement-breakpoint
CREATE INDEX "locations_organization_active_idx" ON "locations" ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "locations_deleted_at_idx" ON "locations" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_one_primary_per_site" ON "locations" ("site_id") WHERE is_primary = true;--> statement-breakpoint
CREATE INDEX "attendance_log_member_id_idx" ON "attendance_logs" ("organization_member_id");--> statement-breakpoint
CREATE INDEX "attendance_log_slot_id_idx" ON "attendance_logs" ("schedule_slot_id");--> statement-breakpoint
CREATE INDEX "attendance_log_work_date_idx" ON "attendance_logs" ("work_date");--> statement-breakpoint
CREATE INDEX "attendance_log_deleted_at_idx" ON "attendance_logs" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_log_unique_per_slot_per_day" ON "attendance_logs" ("organization_member_id","schedule_slot_id","work_date") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "check_in_schedule_role_organization_role_idx" ON "check_in_schedule_roles" ("organization_id","role_id");--> statement-breakpoint
CREATE INDEX "check_in_schedule_organization_id_idx" ON "check_in_schedules" ("organization_id");--> statement-breakpoint
CREATE INDEX "check_in_schedule_deleted_at_idx" ON "check_in_schedules" ("deleted_at");--> statement-breakpoint
CREATE INDEX "schedule_slot_location_loc_organization_idx" ON "schedule_slot_location" ("location_id","organization_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_location_organization_slot_active_idx" ON "schedule_slot_location" ("organization_id","schedule_slot_id","is_active");--> statement-breakpoint
CREATE INDEX "schedule_slot_schedule_id_idx" ON "schedule_slots" ("check_in_schedule_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_deleted_at_idx" ON "schedule_slots" ("deleted_at");--> statement-breakpoint
CREATE INDEX "leave_quota_member_id_idx" ON "leave_quotas" ("organization_member_id");--> statement-breakpoint
CREATE INDEX "leave_quota_type_id_idx" ON "leave_quotas" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_quota_deleted_at_idx" ON "leave_quotas" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_quota_member_type_year_unique" ON "leave_quotas" ("organization_member_id","leave_type_id","year") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "leave_request_member_id_idx" ON "leave_requests" ("organization_member_id");--> statement-breakpoint
CREATE INDEX "leave_request_type_id_idx" ON "leave_requests" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_requests" ("status");--> statement-breakpoint
CREATE INDEX "leave_request_deleted_at_idx" ON "leave_requests" ("deleted_at");--> statement-breakpoint
CREATE INDEX "leave_request_member_date_idx" ON "leave_requests" ("organization_member_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "leave_type_organization_id_idx" ON "leave_types" ("organization_id");--> statement-breakpoint
CREATE INDEX "leave_type_deleted_at_idx" ON "leave_types" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_type_organization_name_unique" ON "leave_types" ("organization_id","name") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "form_answer_organization_field_idx" ON "form_answer" ("organization_id","field_id");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_answer_sort_idx" ON "form_answer_attachment" ("answer_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_organization_key_idx" ON "form_answer_attachment" ("organization_id","storage_key");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_deleted_at_idx" ON "form_answer_attachment" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_role_assignment" ON "form_assignment" ("occurrence_id","role_id") WHERE cancelled_at IS NULL AND role_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_member_assignment" ON "form_assignment" ("occurrence_id","organization_member_id") WHERE cancelled_at IS NULL AND organization_member_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "form_assignment_organization_member_created_idx" ON "form_assignment" ("organization_id","organization_member_id","created_at");--> statement-breakpoint
CREATE INDEX "form_assignment_organization_role_created_idx" ON "form_assignment" ("organization_id","role_id","created_at");--> statement-breakpoint
CREATE INDEX "form_field_section_sort_idx" ON "form_field" ("form_section_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_field_deleted_at_idx" ON "form_field" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_field_option_field_sort_idx" ON "form_field_option" ("field_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_field_option_deleted_at_idx" ON "form_field_option" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_occurrence_organization_opens_idx" ON "form_occurrence" ("organization_id","opens_at");--> statement-breakpoint
CREATE INDEX "form_plan_deleted_at_idx" ON "form_plan" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_plan_organization_effective_idx" ON "form_plan" ("organization_id","effective_from","effective_until");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_answer_review_root" ON "form_review_entry" ("submission_id","answer_id") WHERE answer_id IS NOT NULL AND supersedes_entry_id IS NULL;--> statement-breakpoint
CREATE INDEX "form_review_entry_submission_answer_created_idx" ON "form_review_entry" ("submission_id","answer_id","created_at");--> statement-breakpoint
CREATE INDEX "form_review_entry_organization_reviewer_created_idx" ON "form_review_entry" ("organization_id","reviewed_by","created_at");--> statement-breakpoint
CREATE INDEX "form_section_version_sort_idx" ON "form_section" ("form_version_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_section_deleted_at_idx" ON "form_section" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_submission_deleted_at_idx" ON "form_submission" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_root_submission" ON "form_submission" ("assignment_id") WHERE supersedes_submission_id IS NULL;--> statement-breakpoint
CREATE INDEX "form_submission_organization_submitted_idx" ON "form_submission" ("organization_id","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submission_organization_assignment_idx" ON "form_submission" ("organization_id","assignment_id");--> statement-breakpoint
CREATE INDEX "form_submission_organization_started_by_created_idx" ON "form_submission" ("organization_id","started_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_organization_submitted_by_created_idx" ON "form_submission" ("organization_id","submitted_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_form_version_id_idx" ON "form_submission" ("form_version_id");--> statement-breakpoint
CREATE INDEX "form_submission_contributor_organization_member_idx" ON "form_submission_contributor" ("organization_id","member_id");--> statement-breakpoint
CREATE INDEX "form_template_organization_id_is_active_idx" ON "form_template" ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "form_template_deleted_at_idx" ON "form_template" ("deleted_at");--> statement-breakpoint
CREATE INDEX "form_version_deleted_at_idx" ON "form_version" ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_draft_version" ON "form_version" ("form_template_id") WHERE status = 'DRAFT';--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_published_version" ON "form_version" ("form_template_id") WHERE status = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "form_version_organization_status_idx" ON "form_version" ("organization_id","status");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_site_id_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "site" ADD CONSTRAINT "site_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_feature" ADD CONSTRAINT "organization_feature_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_feature" ADD CONSTRAINT "organization_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_feature" ADD CONSTRAINT "organization_feature_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_site_id_organization_id_site_id_organization_id_fkey" FOREIGN KEY ("site_id","organization_id") REFERENCES "site"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_Rf2jyE6uR5Wr_fkey" FOREIGN KEY ("organization_member_id","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_B7i5lgWyGzJ0_fkey" FOREIGN KEY ("schedule_slot_id","organization_id") REFERENCES "schedule_slots"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_KozsRVQ2tgJ2_fkey" FOREIGN KEY ("schedule_slot_id","location_id","organization_id") REFERENCES "schedule_slot_location"("schedule_slot_id","location_id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedule_roles" ADD CONSTRAINT "check_in_schedule_roles_m9K98YqjSRPR_fkey" FOREIGN KEY ("check_in_schedule_id","organization_id") REFERENCES "check_in_schedules"("id","organization_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedules_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_e91VEIBjhgMJ_fkey" FOREIGN KEY ("schedule_slot_id","organization_id") REFERENCES "schedule_slots"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_BgAnzcHy1mi3_fkey" FOREIGN KEY ("location_id","organization_id") REFERENCES "locations"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_fzvJHluVRePK_fkey" FOREIGN KEY ("check_in_schedule_id","organization_id") REFERENCES "check_in_schedules"("id","organization_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_organization_member_id_organization_member_id_fkey" FOREIGN KEY ("organization_member_id") REFERENCES "organization_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_WdlB1V0td7Ji_fkey" FOREIGN KEY ("organization_member_id") REFERENCES "organization_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_submission_fk" FOREIGN KEY ("submission_id","organization_id","form_version_id") REFERENCES "form_submission"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_field_fk" FOREIGN KEY ("field_id","organization_id","form_version_id") REFERENCES "form_field"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_updated_by_member_fk" FOREIGN KEY ("updated_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_answer_fk" FOREIGN KEY ("answer_id","organization_id") REFERENCES "form_answer"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_uploaded_by_member_fk" FOREIGN KEY ("uploaded_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_occurrence_fk" FOREIGN KEY ("occurrence_id","organization_id","form_version_id") REFERENCES "form_occurrence"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_org_member_fk" FOREIGN KEY ("organization_member_id","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_replaces_fk" FOREIGN KEY ("replaces_assignment_id","organization_id","occurrence_id") REFERENCES "form_assignment"("id","organization_id","occurrence_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_assigned_by_fk" FOREIGN KEY ("assigned_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_cancelled_by_fk" FOREIGN KEY ("cancelled_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_section_fk" FOREIGN KEY ("form_section_id","organization_id","form_version_id") REFERENCES "form_section"("id","organization_id","form_version_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_field_option" ADD CONSTRAINT "form_field_option_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field_option" ADD CONSTRAINT "form_field_option_form_field_fk" FOREIGN KEY ("field_id","organization_id","form_version_id") REFERENCES "form_field"("id","organization_id","form_version_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_plan_fk" FOREIGN KEY ("plan_id","organization_id","form_template_id") REFERENCES "form_plan"("id","organization_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_form_version_fk" FOREIGN KEY ("form_version_id","organization_id","form_template_id") REFERENCES "form_version"("id","organization_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_period_fk" FOREIGN KEY ("period_id","organization_id","plan_id") REFERENCES "form_plan_period"("id","organization_id","plan_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_cancelled_by_fk" FOREIGN KEY ("cancelled_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_form_template_fk" FOREIGN KEY ("form_template_id","organization_id") REFERENCES "form_template"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_supersedes_plan_fk" FOREIGN KEY ("supersedes_plan_id","organization_id","form_template_id") REFERENCES "form_plan"("id","organization_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_fixed_version_fk" FOREIGN KEY ("fixed_version_id","organization_id","form_template_id") REFERENCES "form_version"("id","organization_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_created_by_fk" FOREIGN KEY ("created_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_closed_by_fk" FOREIGN KEY ("closed_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_plan_fk" FOREIGN KEY ("plan_id","organization_id") REFERENCES "form_plan"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_recurring_schedule" ADD CONSTRAINT "form_plan_recurring_schedule_4WmoCU4hcy7l_fkey" FOREIGN KEY ("plan_id","organization_id") REFERENCES "form_plan"("id","organization_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_plan_fk" FOREIGN KEY ("plan_id","organization_id") REFERENCES "form_plan"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_org_member_fk" FOREIGN KEY ("organization_member_id","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_submission_fk" FOREIGN KEY ("submission_id","organization_id","form_version_id") REFERENCES "form_submission"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_answer_fk" FOREIGN KEY ("answer_id","organization_id","submission_id") REFERENCES "form_answer"("id","organization_id","submission_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_supersedes_fk" FOREIGN KEY ("supersedes_entry_id","organization_id","submission_id") REFERENCES "form_review_entry"("id","organization_id","submission_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_reviewed_by_member_fk" FOREIGN KEY ("reviewed_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_form_version_fk" FOREIGN KEY ("form_version_id","organization_id") REFERENCES "form_version"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_assignment_fk" FOREIGN KEY ("assignment_id","organization_id","form_version_id") REFERENCES "form_assignment"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_started_by_member_fk" FOREIGN KEY ("started_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submitted_by_member_fk" FOREIGN KEY ("submitted_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_supersedes_submission_fk" FOREIGN KEY ("supersedes_submission_id","organization_id","form_version_id","assignment_id") REFERENCES "form_submission"("id","organization_id","form_version_id","assignment_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_khbQoUf0OuDZ_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_submission_fk" FOREIGN KEY ("submission_id","organization_id") REFERENCES "form_submission"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_member_fk" FOREIGN KEY ("member_id","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_decision" ADD CONSTRAINT "form_submission_decision_KLYYddg60y3V_fkey" FOREIGN KEY ("submission_id","organization_id","form_version_id") REFERENCES "form_submission"("id","organization_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_decision" ADD CONSTRAINT "form_submission_decision_MLIuj8OovE9G_fkey" FOREIGN KEY ("decided_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_created_by_org_member_fk" FOREIGN KEY ("created_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_form_template_fk" FOREIGN KEY ("form_template_id","organization_id") REFERENCES "form_template"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_created_by_org_member_fk" FOREIGN KEY ("created_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_published_by_org_member_fk" FOREIGN KEY ("published_by","organization_id") REFERENCES "organization_member"("id","organization_id") ON DELETE RESTRICT;
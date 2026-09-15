-- ============================================================================
-- Migration: 20260915210000_refactor_form_workflow
-- Description: Refactor Form Workflow with plans, occurrences, assignments,
--              revisions and review entries.
-- ============================================================================

-- 1. Adds new enum types
CREATE TYPE "form_schedule_kind" AS ENUM ('RECURRING', 'EXPLICIT');
--> statement-breakpoint
CREATE TYPE "form_review_mode" AS ENUM ('NONE', 'OVERALL', 'ALL_SECTIONS', 'ALL_ANSWERS');
--> statement-breakpoint
CREATE TYPE "form_role_distribution" AS ENUM ('SHARED', 'PER_MEMBER');
--> statement-breakpoint
CREATE TYPE "form_late_policy" AS ENUM ('ALLOW', 'DENY');
--> statement-breakpoint
CREATE TYPE "form_missed_policy" AS ENUM ('SKIP', 'CATCH_UP');
--> statement-breakpoint
CREATE TYPE "form_review_action" AS ENUM ('PASS', 'NEEDS_CHANGES', 'APPROVE', 'RETURN');
--> statement-breakpoint

-- 2. Creates new tables in dependency order with their UNIQUE constraints
CREATE TABLE "form_plan" (
    "id" uuid PRIMARY KEY NOT NULL,
    "company_id" uuid NOT NULL,
    "form_template_id" uuid NOT NULL,
    "supersedes_plan_id" uuid,
    "name" text NOT NULL,
    "schedule_kind" "form_schedule_kind" NOT NULL,
    "schedule_config" jsonb,
    "timezone" text NOT NULL,
    "fixed_version_id" uuid,
    "review_mode" "form_review_mode" DEFAULT 'OVERALL' NOT NULL,
    "late_policy" "form_late_policy" DEFAULT 'DENY' NOT NULL,
    "missed_policy" "form_missed_policy" DEFAULT 'SKIP' NOT NULL,
    "effective_from" timestamp with time zone,
    "effective_until" timestamp with time zone,
    "created_by" uuid NOT NULL,
    "closed_by" uuid,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_plan_id_company_unique" UNIQUE ("id", "company_id"),
    CONSTRAINT "form_plan_id_company_template_unique" UNIQUE ("id", "company_id", "form_template_id"),
    CONSTRAINT "form_plan_supersedes_plan_id_unique" UNIQUE ("supersedes_plan_id")
);
--> statement-breakpoint

CREATE TABLE "form_plan_target" (
    "id" uuid PRIMARY KEY NOT NULL,
    "company_id" uuid NOT NULL,
    "plan_id" uuid NOT NULL,
    "role_id" uuid,
    "company_member_id" uuid,
    "role_distribution" "form_role_distribution",
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_plan_target_plan_role_unique" UNIQUE ("plan_id", "role_id"),
    CONSTRAINT "form_plan_target_plan_member_unique" UNIQUE ("plan_id", "company_member_id")
);
--> statement-breakpoint

CREATE TABLE "form_plan_period" (
    "id" uuid PRIMARY KEY NOT NULL,
    "company_id" uuid NOT NULL,
    "plan_id" uuid NOT NULL,
    "opens_at" timestamp with time zone NOT NULL,
    "due_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_plan_period_id_company_plan_unique" UNIQUE ("id", "company_id", "plan_id"),
    CONSTRAINT "form_plan_period_plan_opens_due_unique" UNIQUE ("plan_id", "opens_at", "due_at")
);
--> statement-breakpoint

CREATE TABLE "form_occurrence" (
    "id" uuid PRIMARY KEY NOT NULL,
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
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_occurrence_id_company_unique" UNIQUE ("id", "company_id"),
    CONSTRAINT "form_occurrence_id_company_version_unique" UNIQUE ("id", "company_id", "form_version_id"),
    CONSTRAINT "form_occurrence_plan_key_unique" UNIQUE ("plan_id", "occurrence_key"),
    CONSTRAINT "form_occurrence_plan_period_unique" UNIQUE ("plan_id", "period_id")
);
--> statement-breakpoint

CREATE TABLE "form_assignment" (
    "id" uuid PRIMARY KEY NOT NULL,
    "company_id" uuid NOT NULL,
    "occurrence_id" uuid NOT NULL,
    "form_version_id" uuid NOT NULL,
    "role_id" uuid,
    "company_member_id" uuid,
    "replaces_assignment_id" uuid,
    "assigned_by" uuid,
    "cancelled_at" timestamp with time zone,
    "cancelled_by" uuid,
    "cancel_reason" text,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_assignment_id_company_version_unique" UNIQUE ("id", "company_id", "form_version_id"),
    CONSTRAINT "form_assignment_id_company_occurrence_unique" UNIQUE ("id", "company_id", "occurrence_id"),
    CONSTRAINT "form_assignment_replaces_assignment_id_unique" UNIQUE ("replaces_assignment_id")
);
--> statement-breakpoint

CREATE TABLE "form_review_entry" (
    "id" uuid PRIMARY KEY NOT NULL,
    "company_id" uuid NOT NULL,
    "submission_id" uuid NOT NULL,
    "form_version_id" uuid NOT NULL,
    "answer_id" uuid,
    "section_id" uuid,
    "action" "form_review_action" NOT NULL,
    "note" text,
    "reviewed_by" uuid NOT NULL,
    "supersedes_entry_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "form_review_entry_id_company_submission_unique" UNIQUE ("id", "company_id", "submission_id"),
    CONSTRAINT "form_review_entry_supersedes_entry_id_unique" UNIQUE ("supersedes_entry_id")
);
--> statement-breakpoint

-- 3. Updates to existing tables: unique constraints & cleaning prototype submission data
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_id_company_submission_unique" UNIQUE ("id", "company_id", "submission_id");
--> statement-breakpoint

-- Clear prototype submission data to allow non-null assignment_id migration
DELETE FROM "form_answer_attachment";
--> statement-breakpoint
DELETE FROM "form_answer";
--> statement-breakpoint
DELETE FROM "form_submission_contributor";
--> statement-breakpoint
DROP TABLE IF EXISTS "submission_review" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "form_template_role" CASCADE;
--> statement-breakpoint
DROP TYPE IF EXISTS "submission_review_action";
--> statement-breakpoint

ALTER TABLE "form_submission" DROP CONSTRAINT IF EXISTS "form_submission_form_template_role_fk";
--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT IF EXISTS "form_submission_supersedes_submission_fk";
--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT IF EXISTS "form_submission_id_company_version_role_unique";
--> statement-breakpoint

DELETE FROM "form_submission";
--> statement-breakpoint

ALTER TABLE "form_submission" ADD COLUMN "assignment_id" uuid;
--> statement-breakpoint
ALTER TABLE "form_submission" ALTER COLUMN "assignment_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "form_submission" DROP COLUMN IF EXISTS "role_id";
--> statement-breakpoint
ALTER TABLE "form_submission" DROP COLUMN IF EXISTS "form_template_id";
--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_id_company_version_assignment_unique" UNIQUE ("id", "company_id", "form_version_id", "assignment_id");
--> statement-breakpoint

-- 4. Foreign key constraints
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_form_template_fk" FOREIGN KEY ("form_template_id", "company_id") REFERENCES "form_template"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_supersedes_plan_fk" FOREIGN KEY ("supersedes_plan_id", "company_id", "form_template_id") REFERENCES "form_plan"("id", "company_id", "form_template_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_fixed_version_fk" FOREIGN KEY ("fixed_version_id", "company_id", "form_template_id") REFERENCES "form_version"("id", "company_id", "form_template_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_created_by_fk" FOREIGN KEY ("created_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_closed_by_fk" FOREIGN KEY ("closed_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_plan_fk" FOREIGN KEY ("plan_id", "company_id") REFERENCES "form_plan"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_role_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_company_member_fk" FOREIGN KEY ("company_member_id", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_plan_fk" FOREIGN KEY ("plan_id", "company_id") REFERENCES "form_plan"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_plan_fk" FOREIGN KEY ("plan_id", "company_id", "form_template_id") REFERENCES "form_plan"("id", "company_id", "form_template_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_form_version_fk" FOREIGN KEY ("form_version_id", "company_id", "form_template_id") REFERENCES "form_version"("id", "company_id", "form_template_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_period_fk" FOREIGN KEY ("period_id", "company_id", "plan_id") REFERENCES "form_plan_period"("id", "company_id", "plan_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_cancelled_by_fk" FOREIGN KEY ("cancelled_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_occurrence_fk" FOREIGN KEY ("occurrence_id", "company_id", "form_version_id") REFERENCES "form_occurrence"("id", "company_id", "form_version_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_role_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_company_member_fk" FOREIGN KEY ("company_member_id", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_replaces_fk" FOREIGN KEY ("replaces_assignment_id", "company_id", "occurrence_id") REFERENCES "form_assignment"("id", "company_id", "occurrence_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_assigned_by_fk" FOREIGN KEY ("assigned_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_cancelled_by_fk" FOREIGN KEY ("cancelled_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_assignment_fk" FOREIGN KEY ("assignment_id", "company_id", "form_version_id") REFERENCES "form_assignment"("id", "company_id", "form_version_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_supersedes_submission_fk" FOREIGN KEY ("supersedes_submission_id", "company_id", "form_version_id", "assignment_id") REFERENCES "form_submission"("id", "company_id", "form_version_id", "assignment_id") ON DELETE restrict;
--> statement-breakpoint

ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_submission_fk" FOREIGN KEY ("submission_id", "company_id", "form_version_id") REFERENCES "form_submission"("id", "company_id", "form_version_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_answer_fk" FOREIGN KEY ("answer_id", "company_id", "submission_id") REFERENCES "form_answer"("id", "company_id", "submission_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_section_fk" FOREIGN KEY ("section_id", "company_id", "form_version_id") REFERENCES "form_section"("id", "company_id", "form_version_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_supersedes_fk" FOREIGN KEY ("supersedes_entry_id", "company_id", "submission_id") REFERENCES "form_review_entry"("id", "company_id", "submission_id") ON DELETE restrict;
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_entry_reviewed_by_member_fk" FOREIGN KEY ("reviewed_by", "company_id") REFERENCES "company_member"("id", "company_id") ON DELETE restrict;
--> statement-breakpoint

-- 5. Check constraints
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_schedule_check" CHECK ((schedule_kind = 'RECURRING' AND schedule_config IS NOT NULL AND jsonb_typeof(schedule_config) = 'object') OR (schedule_kind = 'EXPLICIT' AND schedule_config IS NULL));
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_effective_check" CHECK (effective_until IS NULL OR (effective_from IS NOT NULL AND effective_until > effective_from));
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_no_self_check" CHECK (supersedes_plan_id IS NULL OR supersedes_plan_id <> id);
--> statement-breakpoint
ALTER TABLE "form_plan" ADD CONSTRAINT "form_plan_closed_actor_check" CHECK (closed_by IS NULL OR effective_until IS NOT NULL);
--> statement-breakpoint

ALTER TABLE "form_plan_target" ADD CONSTRAINT "form_plan_target_xor_check" CHECK ((role_id IS NOT NULL AND company_member_id IS NULL AND role_distribution IS NOT NULL) OR (role_id IS NULL AND company_member_id IS NOT NULL AND role_distribution IS NULL));
--> statement-breakpoint

ALTER TABLE "form_plan_period" ADD CONSTRAINT "form_plan_period_time_check" CHECK (due_at > opens_at);
--> statement-breakpoint

ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_time_check" CHECK (due_at > opens_at);
--> statement-breakpoint
ALTER TABLE "form_occurrence" ADD CONSTRAINT "form_occurrence_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0));
--> statement-breakpoint

ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_target_check" CHECK (num_nonnulls(role_id, company_member_id) = 1);
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_no_self_check" CHECK (replaces_assignment_id IS NULL OR replaces_assignment_id <> id);
--> statement-breakpoint
ALTER TABLE "form_assignment" ADD CONSTRAINT "form_assignment_cancel_check" CHECK ((cancelled_at IS NULL AND cancelled_by IS NULL AND cancel_reason IS NULL) OR (cancelled_at IS NOT NULL AND cancelled_by IS NOT NULL AND cancel_reason IS NOT NULL AND length(trim(cancel_reason)) > 0));
--> statement-breakpoint

ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_target_action_check" CHECK ((num_nonnulls(answer_id, section_id) = 1 AND action IN ('PASS', 'NEEDS_CHANGES')) OR (answer_id IS NULL AND section_id IS NULL AND action IN ('APPROVE', 'RETURN') AND supersedes_entry_id IS NULL));
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_note_check" CHECK (action NOT IN ('NEEDS_CHANGES', 'RETURN') OR (note IS NOT NULL AND length(trim(note)) > 0));
--> statement-breakpoint
ALTER TABLE "form_review_entry" ADD CONSTRAINT "form_review_no_self_check" CHECK (supersedes_entry_id IS NULL OR supersedes_entry_id <> id);
--> statement-breakpoint

-- 6. Partial unique indexes and performance indexes
CREATE UNIQUE INDEX "form_one_root_submission" ON "form_submission" ("assignment_id") WHERE supersedes_submission_id IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_role_assignment" ON "form_assignment" ("occurrence_id", "role_id") WHERE cancelled_at IS NULL AND role_id IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "form_active_member_assignment" ON "form_assignment" ("occurrence_id", "company_member_id") WHERE cancelled_at IS NULL AND company_member_id IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_answer_review_root" ON "form_review_entry" ("submission_id", "answer_id") WHERE answer_id IS NOT NULL AND supersedes_entry_id IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_section_review_root" ON "form_review_entry" ("submission_id", "section_id") WHERE section_id IS NOT NULL AND supersedes_entry_id IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "form_one_final_review" ON "form_review_entry" ("submission_id") WHERE answer_id IS NULL AND section_id IS NULL;
--> statement-breakpoint
CREATE INDEX "form_plan_company_effective_idx" ON "form_plan" ("company_id", "effective_from", "effective_until");
--> statement-breakpoint
CREATE INDEX "form_occurrence_plan_time_idx" ON "form_occurrence" ("plan_id", "opens_at", "due_at");
--> statement-breakpoint
CREATE INDEX "form_assignment_occurrence_idx" ON "form_assignment" ("occurrence_id");
--> statement-breakpoint
CREATE INDEX "form_assignment_member_idx" ON "form_assignment" ("company_id", "company_member_id");
--> statement-breakpoint
CREATE INDEX "form_assignment_role_idx" ON "form_assignment" ("company_id", "role_id");
--> statement-breakpoint
CREATE INDEX "form_submission_assignment_idx" ON "form_submission" ("assignment_id");
--> statement-breakpoint
CREATE INDEX "form_review_entry_submission_idx" ON "form_review_entry" ("submission_id", "created_at");

CREATE TYPE "form_version_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "form_field_type" AS ENUM('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN', 'DATE', 'IMAGE', 'FILE');--> statement-breakpoint
CREATE TYPE "form_submission_status" AS ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "submission_review_action" AS ENUM('APPROVE', 'REJECT');--> statement-breakpoint

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
);--> statement-breakpoint

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
);--> statement-breakpoint

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
	CONSTRAINT "form_version_template_version_unique" UNIQUE("form_template_id","version"),
	CONSTRAINT "form_version_publish_metadata_check" CHECK ((status = 'DRAFT' AND published_at IS NULL AND published_by IS NULL) OR (status IN ('PUBLISHED', 'ARCHIVED') AND published_at IS NOT NULL AND published_by IS NOT NULL))
);--> statement-breakpoint

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
);--> statement-breakpoint

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
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_field_id_company_version_unique" UNIQUE("id","company_id","form_version_id")
);--> statement-breakpoint

CREATE TABLE "form_submission" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"form_template_id" uuid NOT NULL,
	"form_version_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"started_by" uuid NOT NULL,
	"submitted_by" uuid,
	"revision" integer DEFAULT 1 NOT NULL,
	"supersedes_submission_id" uuid,
	"status" "form_submission_status" DEFAULT 'DRAFT'::"form_submission_status" NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_submission_id_company_version_unique" UNIQUE("id","company_id","form_version_id"),
	CONSTRAINT "form_submission_id_company_version_role_unique" UNIQUE("id","company_id","form_version_id","role_id"),
	CONSTRAINT "form_submission_id_company_unique" UNIQUE("id","company_id"),
	CONSTRAINT "form_submission_supersedes_submission_id_unique" UNIQUE("supersedes_submission_id")
);--> statement-breakpoint

CREATE TABLE "form_submission_contributor" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "form_submission_contributor_submission_member_unique" UNIQUE("submission_id","member_id")
);--> statement-breakpoint

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
);--> statement-breakpoint

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
);--> statement-breakpoint

CREATE TABLE "submission_review" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"reviewed_by" uuid NOT NULL,
	"action" "submission_review_action" NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "submission_review_submission_id_unique" UNIQUE("submission_id"),
	CONSTRAINT "submission_review_reject_note_check" CHECK (action <> 'REJECT' OR (note IS NOT NULL AND length(trim(note)) > 0))
);--> statement-breakpoint

-- Foreign keys
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_created_by_company_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_form_template_id_form_template_id_fk" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_version" ADD CONSTRAINT "form_version_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_form_template_id_form_template_id_fk" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_created_by_company_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_published_by_company_member_id_fk" FOREIGN KEY ("published_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_section" ADD CONSTRAINT "form_section_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_form_version_id_form_version_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_field" ADD CONSTRAINT "form_field_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_version_id_form_version_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_section_id_form_section_id_fk" FOREIGN KEY ("form_section_id") REFERENCES "form_section"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_template_id_form_template_id_fk" FOREIGN KEY ("form_template_id") REFERENCES "form_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_version_id_form_version_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_started_by_company_member_id_fk" FOREIGN KEY ("started_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submitted_by_company_member_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_submission_id_form_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_member_id_company_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_form_version_id_form_version_id_fk" FOREIGN KEY ("form_version_id") REFERENCES "form_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_submission_id_form_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_field_id_form_field_id_fk" FOREIGN KEY ("field_id") REFERENCES "form_field"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_updated_by_company_member_id_fk" FOREIGN KEY ("updated_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_answer_id_form_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "form_answer"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_uploaded_by_company_member_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_submission_id_form_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "form_submission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_reviewed_by_company_member_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "company_member"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- Indexes
CREATE INDEX "form_template_company_id_is_active_idx" ON "form_template" ("company_id","is_active");--> statement-breakpoint
CREATE INDEX "form_template_role_company_role_idx" ON "form_template_role" ("company_id","role_id");--> statement-breakpoint
CREATE INDEX "form_version_company_status_idx" ON "form_version" ("company_id","status");--> statement-breakpoint
CREATE INDEX "form_section_version_sort_idx" ON "form_section" ("form_version_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_field_section_sort_idx" ON "form_field" ("form_section_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_submission_company_status_submitted_idx" ON "form_submission" ("company_id","status","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_role_template_status_idx" ON "form_submission" ("company_id","role_id","form_template_id","status");--> statement-breakpoint
CREATE INDEX "form_submission_company_started_by_created_idx" ON "form_submission" ("company_id","started_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_submitted_by_created_idx" ON "form_submission" ("company_id","submitted_by","created_at");--> statement-breakpoint
CREATE INDEX "form_submission_form_version_id_idx" ON "form_submission" ("form_version_id");--> statement-breakpoint
CREATE INDEX "form_submission_contributor_company_member_idx" ON "form_submission_contributor" ("company_id","member_id");--> statement-breakpoint
CREATE INDEX "form_answer_company_field_idx" ON "form_answer" ("company_id","field_id");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_answer_sort_idx" ON "form_answer_attachment" ("answer_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_answer_attachment_company_key_idx" ON "form_answer_attachment" ("company_id","storage_key");--> statement-breakpoint
CREATE INDEX "submission_review_company_reviewer_created_idx" ON "submission_review" ("company_id","reviewed_by","created_at");--> statement-breakpoint

-- Partial unique indexes per design specification (single draft and single published version per template)
CREATE UNIQUE INDEX "form_version_one_draft_per_template" ON "form_version" ("form_template_id") WHERE "status" = 'DRAFT';--> statement-breakpoint
CREATE UNIQUE INDEX "form_version_one_published_per_template" ON "form_version" ("form_template_id") WHERE "status" = 'PUBLISHED';

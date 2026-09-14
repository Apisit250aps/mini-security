CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"company_branch_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"radius_meters" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "locations_id_company_id_unique" UNIQUE("id","company_id"),
	CONSTRAINT "location_latitude_check" CHECK (latitude BETWEEN -90 AND 90),
	CONSTRAINT "location_longitude_check" CHECK (longitude BETWEEN -180 AND 180),
	CONSTRAINT "location_radius_meters_check" CHECK (radius_meters > 0 AND radius_meters < 'Infinity'::float8),
	CONSTRAINT "location_primary_active_check" CHECK (NOT is_primary OR is_active)
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
ALTER TABLE "attendance_logs" DROP CONSTRAINT "attendance_logs_company_member_id_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "attendance_logs" DROP CONSTRAINT "attendance_logs_schedule_slot_id_schedule_slots_id_fkey";--> statement-breakpoint
ALTER TABLE "schedule_slots" DROP CONSTRAINT "schedule_slots_check_in_schedule_id_check_in_schedules_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer" DROP CONSTRAINT "form_answer_form_version_id_form_version_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer" DROP CONSTRAINT "form_answer_submission_id_form_submission_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer" DROP CONSTRAINT "form_answer_field_id_form_field_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer" DROP CONSTRAINT "form_answer_updated_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer_attachment" DROP CONSTRAINT "form_answer_attachment_answer_id_form_answer_id_fkey";--> statement-breakpoint
ALTER TABLE "form_answer_attachment" DROP CONSTRAINT "form_answer_attachment_uploaded_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_field" DROP CONSTRAINT "form_field_form_version_id_form_version_id_fkey";--> statement-breakpoint
ALTER TABLE "form_field" DROP CONSTRAINT "form_field_form_section_id_form_section_id_fkey";--> statement-breakpoint
ALTER TABLE "form_section" DROP CONSTRAINT "form_section_form_version_id_form_version_id_fkey";--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT "form_submission_form_template_id_form_template_id_fkey";--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT "form_submission_form_version_id_form_version_id_fkey";--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT "form_submission_started_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_submission" DROP CONSTRAINT "form_submission_submitted_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_submission_contributor" DROP CONSTRAINT "form_submission_contributor_GA6fbriijyrK_fkey";--> statement-breakpoint
ALTER TABLE "form_submission_contributor" DROP CONSTRAINT "form_submission_contributor_member_id_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_template" DROP CONSTRAINT "form_template_created_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_template_role" DROP CONSTRAINT "form_template_role_form_template_id_form_template_id_fkey";--> statement-breakpoint
ALTER TABLE "form_version" DROP CONSTRAINT "form_version_form_template_id_form_template_id_fkey";--> statement-breakpoint
ALTER TABLE "form_version" DROP CONSTRAINT "form_version_created_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "form_version" DROP CONSTRAINT "form_version_published_by_company_member_id_fkey";--> statement-breakpoint
ALTER TABLE "submission_review" DROP CONSTRAINT "submission_review_submission_id_form_submission_id_fkey";--> statement-breakpoint
ALTER TABLE "submission_review" DROP CONSTRAINT "submission_review_reviewed_by_company_member_id_fkey";--> statement-breakpoint
DROP INDEX "form_submission_company_status_submitted_idx";--> statement-breakpoint
DROP INDEX "form_submission_company_role_template_status_idx";--> statement-breakpoint
DROP INDEX "role_permission_unique_idx";--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "company_id" uuid;--> statement-breakpoint
UPDATE "attendance_logs" al SET "company_id" = cm."company_id" FROM "company_member" cm WHERE al."company_member_id" = cm."id" AND al."company_id" IS NULL;--> statement-breakpoint
ALTER TABLE "attendance_logs" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "checked_in_latitude" double precision;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "checked_in_longitude" double precision;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "location_name_snapshot" text;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "location_latitude_snapshot" double precision;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "location_longitude_snapshot" double precision;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD COLUMN "radius_meters_snapshot" double precision;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD COLUMN "company_id" uuid;--> statement-breakpoint
UPDATE "schedule_slots" s SET "company_id" = cs."company_id" FROM "check_in_schedules" cs WHERE s."check_in_schedule_id" = cs."id" AND s."company_id" IS NULL;--> statement-breakpoint
ALTER TABLE "schedule_slots" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "start_time" time;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "end_time" time;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD COLUMN "minutes_per_day_snapshot" integer;--> statement-breakpoint
ALTER TABLE "leave_requests" DROP COLUMN "total_days";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "permissions";--> statement-breakpoint
ALTER TABLE "leave_quotas" DROP COLUMN "used_days";--> statement-breakpoint
ALTER TABLE "form_submission" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "form_submission" DROP COLUMN "started_at";--> statement-breakpoint
ALTER TABLE "form_submission_contributor" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "submission_review" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "company_branch" ADD CONSTRAINT "company_branch_id_company_id_unique" UNIQUE("id","company_id");--> statement-breakpoint
ALTER TABLE "company_member" ADD CONSTRAINT "company_member_id_company_unique" UNIQUE("id","company_id");--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_unique_idx" UNIQUE("role_id","permission_id");--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_id_company_unique" UNIQUE("id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_system_default_unique" ON "role" ("role_type") WHERE company_id IS NULL AND is_system_default = true;--> statement-breakpoint
CREATE INDEX "locations_branch_company_idx" ON "locations" ("company_branch_id","company_id");--> statement-breakpoint
CREATE INDEX "locations_company_active_idx" ON "locations" ("company_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_one_primary_per_branch" ON "locations" ("company_branch_id") WHERE is_primary = true;--> statement-breakpoint
CREATE INDEX "schedule_slot_location_loc_company_idx" ON "schedule_slot_location" ("location_id","company_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_location_company_slot_active_idx" ON "schedule_slot_location" ("company_id","schedule_slot_id","is_active");--> statement-breakpoint
CREATE INDEX "form_submission_company_submitted_idx" ON "form_submission" ("company_id","submitted_at");--> statement-breakpoint
CREATE INDEX "form_submission_company_role_template_idx" ON "form_submission" ("company_id","role_id","form_template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_version_one_draft_per_template" ON "form_version" ("form_template_id") WHERE status = 'DRAFT';--> statement-breakpoint
CREATE UNIQUE INDEX "form_version_one_published_per_template" ON "form_version" ("form_template_id") WHERE status = 'PUBLISHED';--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_d3AWot64h46Q_fkey" FOREIGN KEY ("company_branch_id","company_id") REFERENCES "company_branch"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_1Kio5Fh7QLsT_fkey" FOREIGN KEY ("company_member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_c8yTIXXbjqRg_fkey" FOREIGN KEY ("schedule_slot_id","company_id") REFERENCES "schedule_slots"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_70hnccZwoMXO_fkey" FOREIGN KEY ("schedule_slot_id","location_id","company_id") REFERENCES "schedule_slot_location"("schedule_slot_id","location_id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_aSeS7v7gTWE9_fkey" FOREIGN KEY ("schedule_slot_id","company_id") REFERENCES "schedule_slots"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slot_location" ADD CONSTRAINT "schedule_slot_location_v3YGcGNq4CMn_fkey" FOREIGN KEY ("location_id","company_id") REFERENCES "locations"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_x9qeTgyHZzmY_fkey" FOREIGN KEY ("check_in_schedule_id","company_id") REFERENCES "check_in_schedules"("id","company_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_submission_fk" FOREIGN KEY ("submission_id","company_id","form_version_id") REFERENCES "form_submission"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_field_fk" FOREIGN KEY ("field_id","company_id","form_version_id") REFERENCES "form_field"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_updated_by_member_fk" FOREIGN KEY ("updated_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_answer_fk" FOREIGN KEY ("answer_id","company_id") REFERENCES "form_answer"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_uploaded_by_member_fk" FOREIGN KEY ("uploaded_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_form_section_fk" FOREIGN KEY ("form_section_id","company_id","form_version_id") REFERENCES "form_section"("id","company_id","form_version_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_form_version_fk" FOREIGN KEY ("form_version_id","company_id") REFERENCES "form_version"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_version_fk" FOREIGN KEY ("form_version_id","company_id","form_template_id") REFERENCES "form_version"("id","company_id","form_template_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_form_template_role_fk" FOREIGN KEY ("form_template_id","company_id","role_id") REFERENCES "form_template_role"("form_template_id","company_id","role_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_started_by_member_fk" FOREIGN KEY ("started_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submitted_by_member_fk" FOREIGN KEY ("submitted_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_supersedes_submission_fk" FOREIGN KEY ("supersedes_submission_id","company_id","form_version_id","role_id") REFERENCES "form_submission"("id","company_id","form_version_id","role_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_submission_fk" FOREIGN KEY ("submission_id","company_id") REFERENCES "form_submission"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_submission_contributor" ADD CONSTRAINT "form_submission_contributor_member_fk" FOREIGN KEY ("member_id","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template" ADD CONSTRAINT "form_template_created_by_company_member_fk" FOREIGN KEY ("created_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_template_role" ADD CONSTRAINT "form_template_role_form_template_fk" FOREIGN KEY ("form_template_id","company_id") REFERENCES "form_template"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_form_template_fk" FOREIGN KEY ("form_template_id","company_id") REFERENCES "form_template"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_created_by_company_member_fk" FOREIGN KEY ("created_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_published_by_company_member_fk" FOREIGN KEY ("published_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_submission_fk" FOREIGN KEY ("submission_id","company_id") REFERENCES "form_submission"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_reviewed_by_member_fk" FOREIGN KEY ("reviewed_by","company_id") REFERENCES "company_member"("id","company_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_log_latitude_check" CHECK (checked_in_latitude BETWEEN -90 AND 90);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_log_longitude_check" CHECK (checked_in_longitude BETWEEN -180 AND 180);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_log_loc_latitude_check" CHECK (location_latitude_snapshot BETWEEN -90 AND 90);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_log_loc_longitude_check" CHECK (location_longitude_snapshot BETWEEN -180 AND 180);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_log_radius_meters_check" CHECK (radius_meters_snapshot > 0 AND radius_meters_snapshot < 'Infinity'::float8);--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_location_snapshot_complete_check" CHECK (num_nonnulls(location_id, checked_in_latitude, checked_in_longitude, location_name_snapshot, location_latitude_snapshot, location_longitude_snapshot, radius_meters_snapshot) IN (0, 7));--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_location_event_check" CHECK (location_id IS NULL OR (checked_in_at IS NOT NULL AND status IN ('present', 'late')));--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quota_total_days_check" CHECK (total_days >= 0);--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_request_date_order_check" CHECK (end_date >= start_date);--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_request_source_interval_check" CHECK (((unit IN ('day', 'half_day') AND start_time IS NULL AND end_time IS NULL AND minutes_per_day_snapshot IS NULL) OR (unit = 'hour' AND start_date = end_date AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time AND minutes_per_day_snapshot IS NOT NULL AND minutes_per_day_snapshot > 0)));--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_size_check" CHECK (size_bytes > 0);--> statement-breakpoint
ALTER TABLE "form_answer_attachment" ADD CONSTRAINT "form_answer_attachment_sort_order_check" CHECK (sort_order >= 0);--> statement-breakpoint
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_sort_order_check" CHECK (sort_order >= 0);--> statement-breakpoint
ALTER TABLE "form_section" ADD CONSTRAINT "form_section_sort_order_check" CHECK (sort_order >= 0);--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_revision_check" CHECK (revision > 0);--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_status_time_check" CHECK ((submitted_at IS NULL) = (submitted_by IS NULL));--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_time_order_check" CHECK (submitted_at IS NULL OR submitted_at >= created_at);--> statement-breakpoint
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_no_self_revision_check" CHECK (supersedes_submission_id IS NULL OR supersedes_submission_id <> id);--> statement-breakpoint
ALTER TABLE "form_version" ADD CONSTRAINT "form_version_publish_metadata_check" CHECK ((status = 'DRAFT' AND published_at IS NULL AND published_by IS NULL) OR (status IN ('PUBLISHED', 'ARCHIVED') AND published_at IS NOT NULL AND published_by IS NOT NULL));--> statement-breakpoint
ALTER TABLE "submission_review" ADD CONSTRAINT "submission_review_reject_note_check" CHECK (action <> 'REJECT' OR (note IS NOT NULL AND length(trim(note)) > 0));--> statement-breakpoint
DROP TYPE "form_submission_status";
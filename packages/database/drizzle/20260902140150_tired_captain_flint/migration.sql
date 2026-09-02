CREATE TYPE "attendance_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'LATE', 'ABSENT');--> statement-breakpoint
CREATE TYPE "check_type" AS ENUM('CHECK_IN', 'CHECK_OUT', 'BREAK_IN', 'BREAK_OUT', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "leave_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "leave_type" AS ENUM('SICK_LEAVE', 'ANNUAL_LEAVE', 'PERSONAL_LEAVE', 'MATERNITY_LEAVE', 'ABSENT_NO_REASON');--> statement-breakpoint
CREATE TYPE "location_type" AS ENUM('FIXED', 'RADIUS', 'BRANCH');--> statement-breakpoint
CREATE TABLE "attendance_checkpoint" (
	"id" uuid PRIMARY KEY,
	"policy_id" uuid NOT NULL,
	"check_type" "check_type" NOT NULL,
	"label" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"window_start" time,
	"window_end" time,
	"grace_minutes" integer DEFAULT 0,
	"require_photo" boolean DEFAULT true NOT NULL,
	"require_location" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_location" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"branch_id" uuid,
	"name" text NOT NULL,
	"location_type" "location_type" DEFAULT 'RADIUS'::"location_type" NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"radius_meters" integer,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_log" (
	"id" uuid PRIMARY KEY,
	"attendance_record_id" uuid NOT NULL,
	"checkpoint_id" uuid NOT NULL,
	"check_type" "check_type" NOT NULL,
	"checked_at" timestamp NOT NULL,
	"latitude" numeric(10,8),
	"longitude" numeric(11,8),
	"accuracy_meters" numeric(6,2),
	"location_id" uuid,
	"is_location_valid" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"photo_verified" boolean DEFAULT false NOT NULL,
	"device_id" text,
	"ip_address" text,
	"is_manual" boolean DEFAULT false NOT NULL,
	"manual_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_policy" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_record" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"company_member_id" uuid NOT NULL,
	"work_shift_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"status" "attendance_status" DEFAULT 'PENDING'::"attendance_status" NOT NULL,
	"total_work_minutes" integer,
	"overtime_minutes" integer DEFAULT 0,
	"late_minutes" integer DEFAULT 0,
	"note" text,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkpoint_location" (
	"id" uuid PRIMARY KEY,
	"checkpoint_id" uuid NOT NULL,
	"location_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_request" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"company_member_id" uuid NOT NULL,
	"leave_type" "leave_type" NOT NULL,
	"status" "leave_status" DEFAULT 'PENDING'::"leave_status" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" numeric(4,1) NOT NULL,
	"reason" text,
	"attachment_url" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_work_schedule" (
	"id" uuid PRIMARY KEY,
	"company_member_id" uuid NOT NULL,
	"work_shift_id" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_attendance_policy" (
	"id" uuid PRIMARY KEY,
	"role_id" uuid NOT NULL,
	"policy_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_schedule" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_shift" (
	"id" uuid PRIMARY KEY,
	"work_schedule_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_overnight" boolean DEFAULT false NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "checkpoint_policy_id_idx" ON "attendance_checkpoint" ("policy_id");--> statement-breakpoint
CREATE INDEX "checkpoint_type_idx" ON "attendance_checkpoint" ("check_type");--> statement-breakpoint
CREATE INDEX "att_location_company_id_idx" ON "attendance_location" ("company_id");--> statement-breakpoint
CREATE INDEX "att_location_branch_id_idx" ON "attendance_location" ("branch_id");--> statement-breakpoint
CREATE INDEX "att_log_record_idx" ON "attendance_log" ("attendance_record_id");--> statement-breakpoint
CREATE INDEX "att_log_checkpoint_idx" ON "attendance_log" ("checkpoint_id");--> statement-breakpoint
CREATE INDEX "att_log_checked_at_idx" ON "attendance_log" ("checked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "att_log_record_checkpoint_unique" ON "attendance_log" ("attendance_record_id","checkpoint_id");--> statement-breakpoint
CREATE INDEX "attendance_policy_company_id_idx" ON "attendance_policy" ("company_id");--> statement-breakpoint
CREATE INDEX "att_record_company_idx" ON "attendance_record" ("company_id");--> statement-breakpoint
CREATE INDEX "att_record_member_idx" ON "attendance_record" ("company_member_id");--> statement-breakpoint
CREATE INDEX "att_record_date_idx" ON "attendance_record" ("work_date");--> statement-breakpoint
CREATE UNIQUE INDEX "att_record_member_date_unique" ON "attendance_record" ("company_member_id","work_date");--> statement-breakpoint
CREATE INDEX "chk_loc_checkpoint_idx" ON "checkpoint_location" ("checkpoint_id");--> statement-breakpoint
CREATE INDEX "chk_loc_location_idx" ON "checkpoint_location" ("location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "chk_loc_unique_idx" ON "checkpoint_location" ("checkpoint_id","location_id");--> statement-breakpoint
CREATE INDEX "leave_req_company_idx" ON "leave_request" ("company_id");--> statement-breakpoint
CREATE INDEX "leave_req_member_idx" ON "leave_request" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_req_start_date_idx" ON "leave_request" ("start_date");--> statement-breakpoint
CREATE INDEX "leave_req_status_idx" ON "leave_request" ("status");--> statement-breakpoint
CREATE INDEX "member_schedule_member_idx" ON "member_work_schedule" ("company_member_id");--> statement-breakpoint
CREATE INDEX "member_schedule_shift_idx" ON "member_work_schedule" ("work_shift_id");--> statement-breakpoint
CREATE INDEX "member_schedule_date_idx" ON "member_work_schedule" ("effective_date");--> statement-breakpoint
CREATE INDEX "role_att_policy_role_idx" ON "role_attendance_policy" ("role_id");--> statement-breakpoint
CREATE INDEX "role_att_policy_policy_idx" ON "role_attendance_policy" ("policy_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_att_policy_unique_idx" ON "role_attendance_policy" ("role_id","policy_id");--> statement-breakpoint
CREATE INDEX "work_schedule_company_id_idx" ON "work_schedule" ("company_id");--> statement-breakpoint
CREATE INDEX "work_shift_schedule_id_idx" ON "work_shift" ("work_schedule_id");--> statement-breakpoint
CREATE INDEX "work_shift_company_id_idx" ON "work_shift" ("company_id");--> statement-breakpoint
ALTER TABLE "attendance_checkpoint" ADD CONSTRAINT "attendance_checkpoint_policy_id_attendance_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "attendance_policy"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_location" ADD CONSTRAINT "attendance_location_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_location" ADD CONSTRAINT "attendance_location_branch_id_company_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "company_branch"("id");--> statement-breakpoint
ALTER TABLE "attendance_log" ADD CONSTRAINT "attendance_log_attendance_record_id_attendance_record_id_fkey" FOREIGN KEY ("attendance_record_id") REFERENCES "attendance_record"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_log" ADD CONSTRAINT "attendance_log_checkpoint_id_attendance_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "attendance_checkpoint"("id");--> statement-breakpoint
ALTER TABLE "attendance_log" ADD CONSTRAINT "attendance_log_location_id_attendance_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "attendance_location"("id");--> statement-breakpoint
ALTER TABLE "attendance_policy" ADD CONSTRAINT "attendance_policy_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id");--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_work_shift_id_work_shift_id_fkey" FOREIGN KEY ("work_shift_id") REFERENCES "work_shift"("id");--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_approved_by_user_id_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "checkpoint_location" ADD CONSTRAINT "checkpoint_location_checkpoint_id_attendance_checkpoint_id_fkey" FOREIGN KEY ("checkpoint_id") REFERENCES "attendance_checkpoint"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "checkpoint_location" ADD CONSTRAINT "checkpoint_location_location_id_attendance_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "attendance_location"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "member_work_schedule" ADD CONSTRAINT "member_work_schedule_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member_work_schedule" ADD CONSTRAINT "member_work_schedule_work_shift_id_work_shift_id_fkey" FOREIGN KEY ("work_shift_id") REFERENCES "work_shift"("id");--> statement-breakpoint
ALTER TABLE "role_attendance_policy" ADD CONSTRAINT "role_attendance_policy_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_attendance_policy" ADD CONSTRAINT "role_attendance_policy_policy_id_attendance_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "attendance_policy"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_attendance_policy" ADD CONSTRAINT "role_attendance_policy_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_schedule" ADD CONSTRAINT "work_schedule_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_shift" ADD CONSTRAINT "work_shift_work_schedule_id_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedule"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "work_shift" ADD CONSTRAINT "work_shift_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;
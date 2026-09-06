CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "leave_unit" AS ENUM('day', 'half_day', 'hour');--> statement-breakpoint
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
CREATE TABLE "check_in_schedules" (
	"id" uuid PRIMARY KEY,
	"role_id" uuid NOT NULL CONSTRAINT "check_in_schedule_role_id_unique" UNIQUE,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
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
CREATE INDEX "attendance_log_member_id_idx" ON "attendance_logs" ("company_member_id");--> statement-breakpoint
CREATE INDEX "attendance_log_slot_id_idx" ON "attendance_logs" ("schedule_slot_id");--> statement-breakpoint
CREATE INDEX "attendance_log_work_date_idx" ON "attendance_logs" ("work_date");--> statement-breakpoint
CREATE INDEX "check_in_schedule_company_id_idx" ON "check_in_schedules" ("company_id");--> statement-breakpoint
CREATE INDEX "schedule_slot_schedule_id_idx" ON "schedule_slots" ("check_in_schedule_id");--> statement-breakpoint
CREATE INDEX "leave_quota_member_id_idx" ON "leave_quotas" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_quota_type_id_idx" ON "leave_quotas" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_member_id_idx" ON "leave_requests" ("company_member_id");--> statement-breakpoint
CREATE INDEX "leave_request_type_id_idx" ON "leave_requests" ("leave_type_id");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_requests" ("status");--> statement-breakpoint
CREATE INDEX "leave_request_member_date_idx" ON "leave_requests" ("company_member_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "leave_type_company_id_idx" ON "leave_types" ("company_id");--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_schedule_slot_id_schedule_slots_id_fkey" FOREIGN KEY ("schedule_slot_id") REFERENCES "schedule_slots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedules_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedules_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_check_in_schedule_id_check_in_schedules_id_fkey" FOREIGN KEY ("check_in_schedule_id") REFERENCES "check_in_schedules"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_quotas" ADD CONSTRAINT "leave_quotas_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_company_member_id_company_member_id_fkey" FOREIGN KEY ("company_member_id") REFERENCES "company_member"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;
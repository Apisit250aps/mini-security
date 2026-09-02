CREATE TABLE "role_work_schedule" (
	"id" uuid PRIMARY KEY,
	"role_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"work_shift_id" uuid NOT NULL,
	"effective_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "member_work_schedule";--> statement-breakpoint
CREATE INDEX "role_schedule_role_idx" ON "role_work_schedule" ("role_id");--> statement-breakpoint
CREATE INDEX "role_schedule_company_idx" ON "role_work_schedule" ("company_id");--> statement-breakpoint
CREATE INDEX "role_schedule_shift_idx" ON "role_work_schedule" ("work_shift_id");--> statement-breakpoint
CREATE INDEX "role_schedule_date_idx" ON "role_work_schedule" ("effective_date");--> statement-breakpoint
ALTER TABLE "role_work_schedule" ADD CONSTRAINT "role_work_schedule_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_work_schedule" ADD CONSTRAINT "role_work_schedule_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_work_schedule" ADD CONSTRAINT "role_work_schedule_work_shift_id_work_shift_id_fkey" FOREIGN KEY ("work_shift_id") REFERENCES "work_shift"("id");
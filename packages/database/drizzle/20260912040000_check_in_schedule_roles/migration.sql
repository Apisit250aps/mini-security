-- Run during a coordinated API/UI cutover. Drizzle applies migrations in a transaction.
LOCK TABLE "check_in_schedules", "role" IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "check_in_schedules" s
    LEFT JOIN "role" r ON r.id = s.role_id
    WHERE r.id IS NULL OR (r.company_id IS DISTINCT FROM s.company_id AND NOT (r.company_id IS NULL AND r.is_system_default))
  ) THEN
    RAISE EXCEPTION 'Schedule role migration requires company roles or system default roles; correct existing assignments first';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "check_in_schedules" ADD CONSTRAINT "check_in_schedule_id_company_unique" UNIQUE ("id", "company_id");
--> statement-breakpoint
CREATE TABLE "check_in_schedule_roles" (
  "id" uuid PRIMARY KEY,
  "company_id" uuid NOT NULL,
  "check_in_schedule_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "check_in_schedule_role_pair_unique" UNIQUE ("check_in_schedule_id", "role_id"),
  FOREIGN KEY ("check_in_schedule_id", "company_id") REFERENCES "check_in_schedules" ("id", "company_id") ON DELETE CASCADE,
  FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE CASCADE
);
CREATE INDEX "check_in_schedule_role_company_role_idx" ON "check_in_schedule_roles" ("company_id", "role_id");
--> statement-breakpoint
-- Each existing schedule contributes exactly one assignment. Reuse its UUIDv7
-- as the new row ID in this separate table; schedule/slot/log IDs stay unchanged.
INSERT INTO "check_in_schedule_roles" ("id", "company_id", "check_in_schedule_id", "role_id", "is_active", "created_at", "updated_at")
SELECT "id", "company_id", "id", "role_id", true, "created_at", "updated_at"
FROM "check_in_schedules";
--> statement-breakpoint
DO $$ BEGIN
  IF (SELECT count(*) FROM "check_in_schedule_roles") <> (SELECT count(*) FROM "check_in_schedules") THEN
    RAISE EXCEPTION 'Schedule role backfill incomplete';
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "check_in_schedules" DROP CONSTRAINT "check_in_schedule_role_id_unique";
ALTER TABLE "check_in_schedules" DROP COLUMN "role_id";

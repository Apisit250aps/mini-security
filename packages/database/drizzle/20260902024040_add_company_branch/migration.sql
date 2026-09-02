CREATE TABLE IF NOT EXISTS "company_branch" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company_member" ADD COLUMN IF NOT EXISTS "company_branch_id" uuid;
--> statement-breakpoint
-- Backfill default branch for existing companies if any
INSERT INTO "company_branch" ("id", "company_id", "name", "address", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), c."id", 'สำนักงานใหญ่ (Headquarters)', NULL, true, now(), now()
FROM "company" c
WHERE NOT EXISTS (
  SELECT 1 FROM "company_branch" cb WHERE cb."company_id" = c."id"
);
--> statement-breakpoint
-- Backfill existing company members to default branch
UPDATE "company_member" cm
SET "company_branch_id" = (
  SELECT cb."id"
  FROM "company_branch" cb
  WHERE cb."company_id" = cm."company_id"
  ORDER BY cb."created_at" ASC
  LIMIT 1
)
WHERE cm."company_branch_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "company_member" ALTER COLUMN "company_branch_id" SET NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_branch_company_id_idx" ON "company_branch" ("company_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_member_company_branch_id_idx" ON "company_member" ("company_branch_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_branch" ADD CONSTRAINT "company_branch_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_member" ADD CONSTRAINT "company_member_company_branch_id_company_branch_id_fkey" FOREIGN KEY ("company_branch_id") REFERENCES "company_branch"("id") ON DELETE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
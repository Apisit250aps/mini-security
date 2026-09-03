CREATE TABLE "company_feature" (
	"id" uuid PRIMARY KEY,
	"company_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"assigned_by" uuid,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
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
	"updated_at" timestamp NOT NULL
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
	CONSTRAINT "role_feature_role_feature_unique" UNIQUE("role_id","feature_id")
);
--> statement-breakpoint
ALTER TABLE "permission" ADD COLUMN "feature_id" uuid;--> statement-breakpoint
CREATE INDEX "permission_feature_id_idx" ON "permission" ("feature_id");--> statement-breakpoint
CREATE INDEX "company_feature_company_id_idx" ON "company_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "company_feature_feature_id_idx" ON "company_feature" ("feature_id");--> statement-breakpoint
CREATE INDEX "company_feature_is_enabled_idx" ON "company_feature" ("is_enabled");--> statement-breakpoint
CREATE INDEX "feature_code_idx" ON "feature" ("code");--> statement-breakpoint
CREATE INDEX "feature_category_idx" ON "feature" ("category");--> statement-breakpoint
CREATE INDEX "feature_is_active_idx" ON "feature" ("is_active");--> statement-breakpoint
CREATE INDEX "role_feature_company_id_idx" ON "role_feature" ("company_id");--> statement-breakpoint
CREATE INDEX "role_feature_role_id_idx" ON "role_feature" ("role_id");--> statement-breakpoint
CREATE INDEX "role_feature_feature_id_idx" ON "role_feature" ("feature_id");--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "company_feature" ADD CONSTRAINT "company_feature_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_company_id_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_role_id_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_feature" ADD CONSTRAINT "role_feature_feature_id_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "feature"("id") ON DELETE CASCADE;
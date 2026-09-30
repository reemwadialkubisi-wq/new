CREATE TABLE "app_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start" integer DEFAULT 6 NOT NULL,
	"time_zone" text DEFAULT 'Asia/Riyadh' NOT NULL,
	"capacity" jsonb DEFAULT '{"activeAnnualGoals":5,"quarterObjectives":5,"activeProjects":3,"weeklyOutcomes":5,"optionalDaily":{"GREEN":7,"YELLOW":4,"RED":1}}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_settings_user_id_unique" UNIQUE("user_id")
);

--> statement-breakpoint
ALTER TABLE "app_settings" ENABLE ROW LEVEL SECURITY;

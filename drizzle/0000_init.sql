CREATE TABLE `area_focus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`period_plan_id` integer NOT NULL,
	`area` text NOT NULL,
	`focus` text NOT NULL,
	`tier` text DEFAULT 'should' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`period_plan_id`) REFERENCES `period_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `area_focus_plan_area` ON `area_focus` (`period_plan_id`,`area`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'important_date' NOT NULL,
	`date` text NOT NULL,
	`end_date` text,
	`start_time` text,
	`end_time` text,
	`yearly` integer DEFAULT false NOT NULL,
	`area` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE INDEX `events_date` ON `events` (`date`);--> statement-breakpoint
CREATE TABLE `period_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`key` text NOT NULL,
	`year` integer NOT NULL,
	`quarter` integer,
	`month` integer,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`theme` text DEFAULT '' NOT NULL,
	`intention` text DEFAULT '' NOT NULL,
	`priorities` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'planning' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `period_plans_key` ON `period_plans` (`key`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`week_start` integer DEFAULT 6 NOT NULL,
	`time_zone` text DEFAULT 'Asia/Riyadh' NOT NULL,
	`capacity` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);

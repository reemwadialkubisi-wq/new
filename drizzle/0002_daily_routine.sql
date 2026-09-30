CREATE TABLE `day_logs` (
	`date` text PRIMARY KEY NOT NULL,
	`energy` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `routine_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `routine_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routine_checks_item_date` ON `routine_checks` (`item_id`,`date`);--> statement-breakpoint
CREATE TABLE `routine_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`area` text,
	`tier` text DEFAULT 'should' NOT NULL,
	`days` text DEFAULT '0123456' NOT NULL,
	`weekly_minimum` integer,
	`target_count` integer,
	`active_from` text,
	`active_to` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`archived_at` text
);

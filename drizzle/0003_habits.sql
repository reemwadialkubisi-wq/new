CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`area` text,
	`weekly_minimum` integer,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`archived_at` text
);
--> statement-breakpoint
ALTER TABLE `routine_checks` ADD `habit_id` integer REFERENCES habits(id);--> statement-breakpoint
ALTER TABLE `routine_items` ADD `habit_id` integer REFERENCES habits(id);--> statement-breakpoint
ALTER TABLE `routine_items` ADD `choice_habit_ids` text;
CREATE TABLE `admin_security` (
	`username` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_key` text NOT NULL,
	`visitor_id` text NOT NULL,
	`session_id` text NOT NULL,
	`event_type` text NOT NULL,
	`path` text NOT NULL,
	`section` text,
	`referrer` text,
	`source` text,
	`medium` text,
	`campaign` text,
	`reason` text,
	`device` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_events_event_key_unique` ON `analytics_events` (`event_key`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_created` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_visitor` ON `analytics_events` (`visitor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analytics_events_path` ON `analytics_events` (`event_type`,`path`);--> statement-breakpoint
CREATE TABLE `consent_daily` (
	`day` text PRIMARY KEY NOT NULL,
	`accepted` integer DEFAULT 0 NOT NULL,
	`rejected` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `password_reset_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`consumed_at` text,
	`requested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_password_resets_user_time` ON `password_reset_codes` (`username`,`requested_at`);
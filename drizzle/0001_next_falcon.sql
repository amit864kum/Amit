ALTER TABLE `contact_messages` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_messages_status_date` ON `contact_messages` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `posts` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_posts_published_date` ON `posts` (`published`,`published_at`);--> statement-breakpoint
ALTER TABLE `projects` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_projects_featured` ON `projects` (`featured`);
ALTER TABLE `posts` ADD `category` text DEFAULT 'Engineering' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `featured` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_posts_category` ON `posts` (`category`);
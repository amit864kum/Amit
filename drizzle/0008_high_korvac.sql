ALTER TABLE `projects` ADD `destination` text DEFAULT 'case_study' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `published` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `show_on_projects` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `detail_json` text;--> statement-breakpoint
CREATE INDEX `idx_projects_public_order` ON `projects` (`published`,`show_on_projects`,`display_order`);
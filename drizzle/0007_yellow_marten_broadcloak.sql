CREATE TABLE `resume_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`resume_url` text DEFAULT '/resume-amit-kumar.pdf' NOT NULL,
	`file_name` text DEFAULT 'resume-amit-kumar.pdf' NOT NULL,
	`button_label` text DEFAULT 'Download résumé' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

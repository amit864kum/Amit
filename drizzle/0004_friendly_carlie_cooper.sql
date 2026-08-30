ALTER TABLE `projects` ADD `display_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `projects` SET `display_order` = (
	SELECT COUNT(*) FROM `projects` AS `candidate`
	WHERE `candidate`.`featured` > `projects`.`featured`
		OR (`candidate`.`featured` = `projects`.`featured` AND `candidate`.`year` > `projects`.`year`)
		OR (`candidate`.`featured` = `projects`.`featured` AND `candidate`.`year` = `projects`.`year` AND `candidate`.`id` < `projects`.`id`)
);--> statement-breakpoint
CREATE INDEX `idx_projects_display_order` ON `projects` (`display_order`);

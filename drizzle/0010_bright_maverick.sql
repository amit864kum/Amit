ALTER TABLE `contact_messages` ADD `contact_details` text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE `contact_messages` SET `contact_details`=`message` WHERE `contact_details`='';

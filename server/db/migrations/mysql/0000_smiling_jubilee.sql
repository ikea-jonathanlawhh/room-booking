CREATE TABLE `buildings` (
	`id` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_timestamp` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(255) NOT NULL,
	`update_timestamp` timestamp NOT NULL DEFAULT (now()),
	`updated_by` varchar(255) NOT NULL,
	CONSTRAINT `buildings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` varchar(50) NOT NULL,
	`building_id` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`description` text,
	`created_timestamp` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(255) NOT NULL,
	`update_timestamp` timestamp NOT NULL DEFAULT (now()),
	`updated_by` varchar(255) NOT NULL,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE cascade ON UPDATE no action;
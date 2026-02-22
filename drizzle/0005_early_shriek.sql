CREATE TABLE `compliance_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('SAMHSA','CMS','LEXISNEXIS','WESTLAW','MANUAL') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`category` varchar(64) NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`affectedStates` text,
	`sourceUrl` varchar(512),
	`effectiveDate` timestamp,
	`dismissedAt` timestamp,
	`dismissedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_sync_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('SAMHSA','CMS','LEXISNEXIS','WESTLAW','MANUAL') NOT NULL,
	`syncType` varchar(64) NOT NULL,
	`status` enum('success','failed','partial') NOT NULL,
	`recordsChecked` int NOT NULL DEFAULT 0,
	`recordsUpdated` int NOT NULL DEFAULT 0,
	`changesDetected` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_sync_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cpt_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(128),
	`minDurationMin` int,
	`maxDurationMin` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastVerifiedAt` timestamp,
	`sourceUrl` varchar(512),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cpt_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `cpt_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `federal_policy_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('SAMHSA','CMS','LEXISNEXIS','WESTLAW','MANUAL') NOT NULL,
	`title` varchar(512) NOT NULL,
	`summary` text,
	`category` varchar(128),
	`sourceUrl` varchar(512),
	`publishedAt` timestamp,
	`effectiveDate` timestamp,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `federal_policy_updates_id` PRIMARY KEY(`id`)
);

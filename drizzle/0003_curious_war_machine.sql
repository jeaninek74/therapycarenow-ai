CREATE TABLE `provider_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(256) NOT NULL,
	`npiNumber` varchar(10) NOT NULL,
	`licenseType` varchar(64) NOT NULL,
	`licenseState` varchar(2) NOT NULL,
	`licenseNumber` varchar(64),
	`specialty` text,
	`phone` varchar(32),
	`website` varchar(512),
	`bookingUrl` varchar(512),
	`telehealthAvailable` boolean DEFAULT false,
	`city` varchar(128),
	`stateCode` varchar(2),
	`zipCode` varchar(10),
	`bio` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`npiLookupResult` text,
	`npiValid` boolean DEFAULT false,
	`adminNotes` text,
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`providerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `provider_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `providers` ADD `npiNumber` varchar(10);--> statement-breakpoint
ALTER TABLE `providers` ADD `verificationStatus` enum('unverified','pending','verified','rejected','expired') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `providers` ADD `npiVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `providers` ADD `licenseVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `providers` ADD `verificationNotes` text;--> statement-breakpoint
ALTER TABLE `providers` ADD `npiData` text;--> statement-breakpoint
CREATE INDEX `idx_submission_status` ON `provider_submissions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_submission_npi` ON `provider_submissions` (`npiNumber`);--> statement-breakpoint
CREATE INDEX `idx_provider_verification` ON `providers` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `idx_provider_npi` ON `providers` (`npiNumber`);
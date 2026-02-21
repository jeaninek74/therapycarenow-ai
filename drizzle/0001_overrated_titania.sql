CREATE TABLE `audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(64) NOT NULL,
	`riskLevel` enum('EMERGENCY','URGENT','ROUTINE'),
	`triggerSource` varchar(64),
	`moderationOutcome` varchar(32),
	`stateCode` varchar(2),
	`resourceType` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentType` varchar(64) NOT NULL,
	`granted` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crisis_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateCode` varchar(2),
	`name` varchar(256) NOT NULL,
	`resourceType` enum('call_911','call_988','text_988','chat_988','crisis_text_line','state_hotline','local_crisis_center') NOT NULL,
	`phone` varchar(32),
	`smsNumber` varchar(32),
	`chatUrl` varchar(512),
	`description` text,
	`isNational` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 10,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crisis_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eap_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employerId` int NOT NULL,
	`resourceName` varchar(256) NOT NULL,
	`phone` varchar(32),
	`url` varchar(512),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `eap_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`nameNormalized` varchar(256) NOT NULL,
	`eapProvider` varchar(256),
	`eapPhone` varchar(32),
	`eapUrl` varchar(512),
	`eapSessions` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `employers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `free_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateCode` varchar(2),
	`name` varchar(256) NOT NULL,
	`category` enum('community_clinic','sliding_scale','hotline','support_group','county_resource','national_program') NOT NULL,
	`phone` varchar(32),
	`website` varchar(512),
	`address` text,
	`description` text,
	`isNational` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `free_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provider_insurance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`insuranceName` varchar(256) NOT NULL,
	`planName` varchar(256),
	CONSTRAINT `provider_insurance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provider_specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`specialty` varchar(128) NOT NULL,
	CONSTRAINT `provider_specialties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`licenseState` varchar(2) NOT NULL,
	`licenseNumber` varchar(64),
	`licenseType` varchar(64),
	`telehealthAvailable` boolean NOT NULL DEFAULT false,
	`inPersonAvailable` boolean NOT NULL DEFAULT true,
	`city` varchar(128),
	`stateCode` varchar(2),
	`zipCode` varchar(10),
	`phone` varchar(32),
	`bookingUrl` varchar(512),
	`website` varchar(512),
	`languages` text,
	`costTag` enum('free','sliding_scale','insurance','self_pay') DEFAULT 'insurance',
	`acceptsNewPatients` boolean NOT NULL DEFAULT true,
	`urgencyAvailability` enum('within_24h','within_72h','this_week','flexible') DEFAULT 'flexible',
	`bio` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `state_compliance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateCode` varchar(2) NOT NULL,
	`stateName` varchar(64) NOT NULL,
	`telehealthLawSummary` text,
	`mandatoryReportingNotes` text,
	`crisisLineNotes` text,
	`licensureRequirements` text,
	`privacyNotes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `state_compliance_id` PRIMARY KEY(`id`),
	CONSTRAINT `state_compliance_stateCode_unique` UNIQUE(`stateCode`)
);
--> statement-breakpoint
CREATE TABLE `triage_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionToken` varchar(64) NOT NULL,
	`userId` int,
	`riskLevel` enum('EMERGENCY','URGENT','ROUTINE') NOT NULL,
	`immediateDanger` boolean NOT NULL DEFAULT false,
	`harmSelf` boolean NOT NULL DEFAULT false,
	`harmOthers` boolean NOT NULL DEFAULT false,
	`needHelpSoon` boolean NOT NULL DEFAULT false,
	`needHelpToday` boolean NOT NULL DEFAULT false,
	`stateCode` varchar(2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `triage_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `triage_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stateCode` varchar(2),
	`insuranceCarrier` varchar(256),
	`insurancePlan` varchar(256),
	`employerName` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_crisis_state` ON `crisis_resources` (`stateCode`);--> statement-breakpoint
CREATE INDEX `idx_crisis_national` ON `crisis_resources` (`isNational`);--> statement-breakpoint
CREATE INDEX `idx_free_state` ON `free_resources` (`stateCode`);--> statement-breakpoint
CREATE INDEX `idx_free_category` ON `free_resources` (`category`);--> statement-breakpoint
CREATE INDEX `idx_insurance_name` ON `provider_insurance` (`insuranceName`);--> statement-breakpoint
CREATE INDEX `idx_specialty` ON `provider_specialties` (`specialty`);--> statement-breakpoint
CREATE INDEX `idx_provider_state` ON `providers` (`licenseState`);--> statement-breakpoint
CREATE INDEX `idx_provider_telehealth` ON `providers` (`telehealthAvailable`);--> statement-breakpoint
CREATE INDEX `idx_provider_cost` ON `providers` (`costTag`);
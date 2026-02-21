CREATE TABLE `billing_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicianId` int NOT NULL,
	`clientId` int NOT NULL,
	`sessionNoteId` int,
	`cptCode` varchar(16),
	`diagnosisCode` varchar(16),
	`suggestedCptCode` varchar(16),
	`issueFlags` text,
	`sessionDate` timestamp NOT NULL,
	`sessionDurationMin` int,
	`status` enum('pending','submitted','approved','denied','corrected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`mood` int NOT NULL,
	`energy` int NOT NULL,
	`anxiety` int NOT NULL,
	`sleep` int,
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicianId` int NOT NULL,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL,
	`dateOfBirth` varchar(16),
	`diagnosisCodes` text,
	`goals` text,
	`status` enum('active','inactive','discharged','waitlist') NOT NULL DEFAULT 'active',
	`riskLevel` enum('low','moderate','high','crisis') DEFAULT 'low',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinician_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`npiNumber` varchar(10) NOT NULL,
	`npiVerified` boolean NOT NULL DEFAULT false,
	`npiVerifiedAt` timestamp,
	`npiData` text,
	`licenseType` enum('therapist','social_worker','psychiatrist','psychologist','counselor','other') NOT NULL,
	`licenseState` varchar(2) NOT NULL,
	`licenseNumber` varchar(64),
	`specialty` varchar(256),
	`practiceType` enum('solo','group','hospital','community','telehealth_only') DEFAULT 'solo',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinician_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinician_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `clinician_profiles_npiNumber_unique` UNIQUE(`npiNumber`)
);
--> statement-breakpoint
CREATE TABLE `homework_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homework_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intake_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`questionKey` varchar(128) NOT NULL,
	`questionText` text,
	`answer` text NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intake_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`flagType` varchar(64) NOT NULL,
	`severity` enum('low','moderate','high','critical') NOT NULL,
	`source` enum('note','checkin','intake','manual') NOT NULL,
	`sourceId` int,
	`description` text,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `risk_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`noteType` enum('SOAP','DAP') NOT NULL DEFAULT 'SOAP',
	`sessionDate` timestamp NOT NULL,
	`rawTranscript` text,
	`generatedNote` text,
	`approvedNote` text,
	`status` enum('draft','pending_review','approved','signed') NOT NULL DEFAULT 'draft',
	`approvedAt` timestamp,
	`sessionDurationMin` int,
	`cptCode` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treatment_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`clinicianId` int NOT NULL,
	`diagnosisCodes` text,
	`goals` text,
	`interventions` text,
	`aiSuggestions` text,
	`progressNotes` text,
	`status` enum('active','completed','discontinued') NOT NULL DEFAULT 'active',
	`reviewDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treatment_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','clinician') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `idx_billing_clinician` ON `billing_records` (`clinicianId`);--> statement-breakpoint
CREATE INDEX `idx_billing_client` ON `billing_records` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_billing_status` ON `billing_records` (`status`);--> statement-breakpoint
CREATE INDEX `idx_checkin_client` ON `client_checkins` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_checkin_date` ON `client_checkins` (`completedAt`);--> statement-breakpoint
CREATE INDEX `idx_client_clinician` ON `clients` (`clinicianId`);--> statement-breakpoint
CREATE INDEX `idx_client_status` ON `clients` (`status`);--> statement-breakpoint
CREATE INDEX `idx_clinician_npi` ON `clinician_profiles` (`npiNumber`);--> statement-breakpoint
CREATE INDEX `idx_clinician_user` ON `clinician_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_hw_client` ON `homework_assignments` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_hw_completed` ON `homework_assignments` (`isCompleted`);--> statement-breakpoint
CREATE INDEX `idx_intake_client` ON `intake_responses` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_risk_client` ON `risk_flags` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_risk_severity` ON `risk_flags` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_risk_resolved` ON `risk_flags` (`isResolved`);--> statement-breakpoint
CREATE INDEX `idx_note_client` ON `session_notes` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_note_clinician` ON `session_notes` (`clinicianId`);--> statement-breakpoint
CREATE INDEX `idx_note_status` ON `session_notes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_plan_client` ON `treatment_plans` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_plan_clinician` ON `treatment_plans` (`clinicianId`);
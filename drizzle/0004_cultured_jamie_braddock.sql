CREATE TABLE `clinician_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(64),
	`stripeSubscriptionId` varchar(64),
	`stripePriceId` varchar(64),
	`status` enum('trialing','active','past_due','canceled','unpaid','incomplete','paused') NOT NULL DEFAULT 'trialing',
	`trialStartAt` timestamp NOT NULL DEFAULT (now()),
	`trialEndAt` timestamp NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinician_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinician_subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `message_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicianId` int NOT NULL,
	`clientId` int NOT NULL,
	`lastMessageAt` timestamp,
	`clinicianUnreadCount` int NOT NULL DEFAULT 0,
	`clientUnreadCount` int NOT NULL DEFAULT 0,
	`retentionDays` int NOT NULL DEFAULT 90,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `secure_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`senderType` enum('clinician','client') NOT NULL,
	`senderId` int NOT NULL,
	`encryptedContent` text NOT NULL,
	`iv` varchar(32) NOT NULL,
	`authTag` varchar(32) NOT NULL,
	`readAt` timestamp,
	`deletedAt` timestamp,
	`deletedBy` int,
	`purgeAfter` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `secure_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeEventId` varchar(64) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`processedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_events_stripeEventId_unique` UNIQUE(`stripeEventId`)
);
--> statement-breakpoint
CREATE INDEX `idx_sub_user` ON `clinician_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_sub_stripe` ON `clinician_subscriptions` (`stripeSubscriptionId`);--> statement-breakpoint
CREATE INDEX `idx_thread_clinician` ON `message_threads` (`clinicianId`);--> statement-breakpoint
CREATE INDEX `idx_thread_client` ON `message_threads` (`clientId`);--> statement-breakpoint
CREATE INDEX `idx_msg_thread` ON `secure_messages` (`threadId`);--> statement-breakpoint
CREATE INDEX `idx_msg_sender` ON `secure_messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `idx_msg_purge` ON `secure_messages` (`purgeAfter`);
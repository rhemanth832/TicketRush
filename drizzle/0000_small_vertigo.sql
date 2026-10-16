CREATE TABLE `market_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_email_unique` ON `market_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `market_events` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`status` text NOT NULL,
	`starts_at` text NOT NULL,
	`city` text NOT NULL,
	`document` text NOT NULL,
	`inventory` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `market_event_owner` ON `market_events` (`owner_id`);--> statement-breakpoint
CREATE INDEX `market_event_public` ON `market_events` (`status`,`starts_at`);--> statement-breakpoint
CREATE TABLE `market_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`status` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`document` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `market_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_order_idempotency` ON `market_orders` (`user_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `market_order_event` ON `market_orders` (`event_id`);--> statement-breakpoint
CREATE INDEX `market_order_user` ON `market_orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `market_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `market_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`kind` text NOT NULL,
	`family` text NOT NULL,
	`revoked` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `market_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `market_session_user` ON `market_sessions` (`user_id`);
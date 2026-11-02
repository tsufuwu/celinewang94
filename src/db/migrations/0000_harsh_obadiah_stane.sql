CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`chapter_number` integer NOT NULL,
	`title` text NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`paragraphs` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chapters_story_idx` ON `chapters` (`story_id`);--> statement-breakpoint
CREATE INDEX `chapters_story_number_idx` ON `chapters` (`story_id`,`chapter_number`);--> statement-breakpoint
CREATE TABLE `guestbook_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_name` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gb_parent_idx` ON `guestbook_posts` (`parent_id`);--> statement-breakpoint
CREATE TABLE `paragraph_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`paragraph_index` integer NOT NULL,
	`author_name` text NOT NULL,
	`content` text NOT NULL,
	`is_typo_report` integer DEFAULT false NOT NULL,
	`is_resolved` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pc_chapter_idx` ON `paragraph_comments` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `pc_chapter_paragraph_idx` ON `paragraph_comments` (`chapter_id`,`paragraph_index`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`author_name` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_story_idx` ON `reviews` (`story_id`);--> statement-breakpoint
CREATE INDEX `reviews_parent_idx` ON `reviews` (`parent_id`);--> statement-breakpoint
CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`cover_url` text,
	`description` text,
	`status` text DEFAULT 'ONGOING' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stories_slug_unique` ON `stories` (`slug`);--> statement-breakpoint
CREATE INDEX `stories_slug_idx` ON `stories` (`slug`);
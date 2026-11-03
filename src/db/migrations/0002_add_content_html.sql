ALTER TABLE `stories` ADD `content_html` text;
ALTER TABLE `stories` ADD `custom_css` text;
ALTER TABLE `chapters` ADD `content_html` text;

CREATE TABLE IF NOT EXISTS `editor_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'custom' NOT NULL,
	`html_code` text NOT NULL,
	`css_code` text,
	`is_builtin` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);

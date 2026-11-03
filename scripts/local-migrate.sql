ALTER TABLE chapters ADD password text;
ALTER TABLE chapters ADD password_hint text;
ALTER TABLE stories ADD content_html text;
ALTER TABLE stories ADD custom_css text;
ALTER TABLE chapters ADD content_html text;
CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY NOT NULL, email text NOT NULL UNIQUE, name text, nickname text, image text, role text DEFAULT 'USER' NOT NULL, unlocked_chapters text DEFAULT '[]' NOT NULL, created_at integer NOT NULL);
CREATE TABLE IF NOT EXISTS reading_progress (id text PRIMARY KEY NOT NULL, user_id text NOT NULL, story_id text NOT NULL, chapter_id text NOT NULL, paragraph_index integer DEFAULT 0 NOT NULL, updated_at integer NOT NULL);

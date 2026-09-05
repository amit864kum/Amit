CREATE TABLE "admin_security" (
	"username" text PRIMARY KEY NOT NULL,
	"password_hash" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"contact_details" text DEFAULT '' NOT NULL,
	"service" text NOT NULL,
	"budget" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"content_json" text,
	"category" text DEFAULT 'Engineering' NOT NULL,
	"image_url" text,
	"featured" integer DEFAULT 0 NOT NULL,
	"published_at" text NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"content_json" text,
	"tech" text NOT NULL,
	"year" text NOT NULL,
	"image_url" text,
	"project_url" text,
	"github_url" text,
	"featured" integer DEFAULT 0 NOT NULL,
	"destination" text DEFAULT 'case_study' NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"show_on_projects" integer DEFAULT 1 NOT NULL,
	"detail_json" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"resume_url" text DEFAULT '/resume-amit-kumar.pdf' NOT NULL,
	"file_name" text DEFAULT 'resume-amit-kumar.pdf' NOT NULL,
	"button_label" text DEFAULT 'Download résumé' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_messages_status_date" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_password_resets_user_time" ON "password_reset_codes" USING btree ("username","requested_at");--> statement-breakpoint
CREATE INDEX "idx_posts_published_date" ON "posts" USING btree ("published","published_at");--> statement-breakpoint
CREATE INDEX "idx_posts_category" ON "posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_projects_featured" ON "projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "idx_projects_display_order" ON "projects" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_projects_public_order" ON "projects" USING btree ("published","show_on_projects","display_order");--> statement-breakpoint
CREATE INDEX "idx_rate_limits_updated" ON "rate_limits" USING btree ("updated_at");
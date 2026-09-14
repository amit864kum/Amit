-- Existing Neon databases may predate the contact_details column even when
-- the current baseline schema includes it. Keep legacy enquiries readable.
ALTER TABLE "contact_messages" ADD COLUMN IF NOT EXISTS "contact_details" text DEFAULT '' NOT NULL;
--> statement-breakpoint
UPDATE "contact_messages" SET "contact_details" = "message" WHERE "contact_details" = '' AND "message" <> '';

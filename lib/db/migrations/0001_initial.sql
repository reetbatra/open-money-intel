CREATE TABLE IF NOT EXISTS "subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(320) NOT NULL UNIQUE,
  "source" varchar(64) DEFAULT 'web',
  "verified" boolean DEFAULT true,
  "unsubscribed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "digests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "generated_at" timestamp DEFAULT now() NOT NULL,
  "range_start" timestamp NOT NULL,
  "range_end" timestamp NOT NULL,
  "payload" jsonb NOT NULL,
  "html_body" text,
  "text_body" text,
  "sent_at" timestamp
);

CREATE INDEX IF NOT EXISTS "subscribers_email_idx" ON "subscribers" ("email");
CREATE INDEX IF NOT EXISTS "digests_generated_idx" ON "digests" ("generated_at" DESC);

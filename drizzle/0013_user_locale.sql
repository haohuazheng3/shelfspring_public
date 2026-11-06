-- The person's language (project documentation §6): a native locale id ("ja-jp", "de-ch"…) or null for English.
-- Pushes, alert emails and Stripe pages follow it. Additive, safe to re-run.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locale" text;

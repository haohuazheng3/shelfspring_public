-- Destination only. Source IDs are provenance, never the destination serial primary key.
ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS inventory_source text;
--> statement-breakpoint
ALTER TABLE availability_events ADD COLUMN IF NOT EXISTS source_event_id text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS events_inventory_source_idx ON availability_events (inventory_source, source_event_id);
--> statement-breakpoint
ALTER TABLE restock_reports ADD COLUMN IF NOT EXISTS inventory_source text;
--> statement-breakpoint
ALTER TABLE restock_reports ADD COLUMN IF NOT EXISTS source_report_id text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS inventory_sync_state (
  source text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS inventory_sync_outbox (
  source text NOT NULL,
  source_event_id text NOT NULL,
  event_id bigint NOT NULL,
  status text NOT NULL CHECK (status IN ('suppressed', 'pending', 'delivering', 'sent', 'failed', 'uncertain', 'expired')),
  reason text,
  claim text,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, source_event_id)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS inventory_sync_outbox_status_idx ON inventory_sync_outbox (source, status);

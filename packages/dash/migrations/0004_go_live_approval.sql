-- Add Go Live approval columns to merchant_dashboards table
-- Values: NULL (not submitted), 'pending', 'approved', 'rejected'

ALTER TABLE merchant_dashboards ADD COLUMN go_live_status TEXT DEFAULT NULL;
ALTER TABLE merchant_dashboards ADD COLUMN go_live_submitted_at TEXT DEFAULT NULL;
ALTER TABLE merchant_dashboards ADD COLUMN go_live_reviewed_at TEXT DEFAULT NULL;
ALTER TABLE merchant_dashboards ADD COLUMN go_live_reviewed_by TEXT DEFAULT NULL;
ALTER TABLE merchant_dashboards ADD COLUMN go_live_rejection_notes TEXT DEFAULT NULL;

-- Index for efficient filtering by go_live_status
CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_go_live_status ON merchant_dashboards(go_live_status);

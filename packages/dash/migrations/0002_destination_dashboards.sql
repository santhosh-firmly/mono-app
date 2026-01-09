-- Migration: Create destination dashboards table
-- Tracks which destinations have dashboards created by Firmly admins.
-- Full destination data is stored in DestinationDO (Durable Object).
-- This follows the same pattern as merchant_dashboards.

CREATE TABLE IF NOT EXISTS destination_dashboards (
  app_id TEXT PRIMARY KEY,                    -- Destination identifier (from app_identifiers in firmlyConfigs)
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,                            -- Admin user ID who created it
  owner_user_id TEXT,                         -- User ID of owner (populated after invite acceptance)
  status TEXT DEFAULT 'pending',              -- pending, active, suspended
  notes TEXT,                                 -- Admin notes
  info TEXT                                   -- JSON blob for company/contact data
);

CREATE INDEX IF NOT EXISTS idx_destination_dashboards_status ON destination_dashboards(status);
CREATE INDEX IF NOT EXISTS idx_destination_dashboards_created_at ON destination_dashboards(created_at);

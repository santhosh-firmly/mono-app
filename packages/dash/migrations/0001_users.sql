-- Migration: Create initial schema
-- Users table: minimal index for queryability and admin operations.
-- Full user data is stored in DashUserDO (Durable Object).

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- UUID, matches Durable Object name
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Merchant dashboards table
-- Tracks which merchant domains have dashboards created by Firmly admins.
-- Full merchant data is stored in MerchantDO (Durable Object).
CREATE TABLE IF NOT EXISTS merchant_dashboards (
  domain TEXT PRIMARY KEY,                    -- Merchant domain (e.g., "merchant.com")
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,                            -- Admin user ID who created it
  owner_user_id TEXT,                         -- User ID of owner (populated after invite acceptance)
  status TEXT DEFAULT 'pending',              -- pending, active, suspended
  notes TEXT,                                 -- Admin notes
  info TEXT                                   -- JSON blob for company/contact data
);

CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_status ON merchant_dashboards(status);
CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_created_at ON merchant_dashboards(created_at);

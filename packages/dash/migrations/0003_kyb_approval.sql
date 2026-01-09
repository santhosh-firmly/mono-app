-- Migration: Add KYB approval fields to merchant_dashboards
-- Tracks KYB submission and approval status for each merchant

-- Add kyb_status column to merchant_dashboards
-- Values: NULL (not submitted), 'pending', 'approved', 'rejected'
ALTER TABLE merchant_dashboards ADD COLUMN kyb_status TEXT DEFAULT NULL;

-- Add kyb_submitted_at for tracking submission time
ALTER TABLE merchant_dashboards ADD COLUMN kyb_submitted_at TEXT DEFAULT NULL;

-- Add kyb_reviewed_at for tracking review time
ALTER TABLE merchant_dashboards ADD COLUMN kyb_reviewed_at TEXT DEFAULT NULL;

-- Add kyb_reviewed_by for admin who reviewed
ALTER TABLE merchant_dashboards ADD COLUMN kyb_reviewed_by TEXT DEFAULT NULL;

-- Add kyb_rejection_notes for rejection reason
ALTER TABLE merchant_dashboards ADD COLUMN kyb_rejection_notes TEXT DEFAULT NULL;

-- Index for efficient filtering of pending KYB merchants
CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_kyb_status ON merchant_dashboards(kyb_status);

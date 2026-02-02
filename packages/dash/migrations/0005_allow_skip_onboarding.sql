-- Add allow_skip_onboarding column to merchant_dashboards table
-- When set to 1, merchants can skip the onboarding flow temporarily

ALTER TABLE merchant_dashboards ADD COLUMN allow_skip_onboarding INTEGER DEFAULT 0;

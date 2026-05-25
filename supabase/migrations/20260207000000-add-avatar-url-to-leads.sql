-- Migration: Add avatar_url to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS avatar_url TEXT;

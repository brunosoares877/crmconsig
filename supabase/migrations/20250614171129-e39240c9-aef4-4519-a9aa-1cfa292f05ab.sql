
-- Add representative_mode column to the leads table
ALTER TABLE public.leads
ADD COLUMN representative_mode TEXT DEFAULT 'nao';

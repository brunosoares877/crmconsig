-- Add priority column to reminders table
ALTER TABLE reminders ADD COLUMN priority text DEFAULT 'media';

-- Add check constraint for valid priority values
ALTER TABLE reminders ADD CONSTRAINT reminders_priority_check 
CHECK (priority IN ('baixa', 'media', 'alta'));

-- Update existing records to have default priority
UPDATE reminders SET priority = 'media' WHERE priority IS NULL; 
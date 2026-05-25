-- Add avatar_url column to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_avatar_url ON leads(avatar_url) WHERE avatar_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN leads.avatar_url IS 'URL of the WhatsApp profile picture';

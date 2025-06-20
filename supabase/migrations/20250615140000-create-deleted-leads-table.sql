-- Create deleted_leads table
CREATE TABLE IF NOT EXISTS deleted_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_lead_id UUID NOT NULL,
  original_lead_data JSONB NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_deleted_leads_user_id ON deleted_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_leads_expires_at ON deleted_leads(expires_at);

-- Create function to cleanup expired deleted leads
CREATE OR REPLACE FUNCTION cleanup_expired_deleted_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM deleted_leads 
  WHERE expires_at < NOW();
END;
$$;

-- Create a cron job to run cleanup every day at 2 AM
SELECT cron.schedule(
  'cleanup-expired-deleted-leads',
  '0 2 * * *',
  'SELECT cleanup_expired_deleted_leads();'
); 
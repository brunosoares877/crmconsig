-- Create table for storing WhatsApp messages
CREATE TABLE IF NOT EXISTS lead_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    status TEXT DEFAULT 'sent',
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster queries on lead history
CREATE INDEX IF NOT EXISTS idx_lead_messages_lead_id ON lead_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_messages_created_at ON lead_messages(created_at);

-- RLS Policies
ALTER TABLE lead_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (staff) to view all messages
CREATE POLICY "Staff can view all messages" 
ON lead_messages FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users (staff/system) to insert messages
CREATE POLICY "Staff can insert messages" 
ON lead_messages FOR INSERT 
TO authenticated 
WITH CHECK (true);

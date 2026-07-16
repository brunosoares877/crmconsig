import fs from 'fs';

const sql = `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message_queue' AND column_name='user_id') THEN
        ALTER TABLE message_queue ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

UPDATE message_queue mq
SET user_id = pl.user_id
FROM prospecting_leads pl
WHERE mq.lead_id = pl.id AND mq.user_id IS NULL;

DROP POLICY IF EXISTS "message_queue_user" ON message_queue;
CREATE POLICY "message_queue_user" ON message_queue FOR ALL 
USING (user_id = auth.uid() OR lead_id IN (SELECT id FROM prospecting_leads WHERE user_id = auth.uid()));
`;

async function run() {
  const res = await fetch("https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: sql
  });
  
  const text = await res.text();
  console.log("Migration Result:", text);
}

run();

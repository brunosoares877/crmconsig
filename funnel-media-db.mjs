import fs from 'fs';

const sql = `
INSERT INTO storage.buckets (id, name, public) VALUES ('funnel-media', 'funnel-media', true) ON CONFLICT DO NOTHING;

ALTER TABLE whatsapp_funnel_steps ADD COLUMN IF NOT EXISTS media_url TEXT;

DROP POLICY IF EXISTS "Give public access to funnel-media" ON storage.objects;
CREATE POLICY "Give public access to funnel-media" ON storage.objects FOR SELECT USING (bucket_id = 'funnel-media');

DROP POLICY IF EXISTS "Allow authenticated uploads to funnel-media" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to funnel-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'funnel-media');
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
  console.log("DB Changes Result:", text);
}

run();

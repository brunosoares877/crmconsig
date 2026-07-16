import fs from 'fs';

const sql = `
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'process-message-queue',
  '* * * * *',
  $$
    SELECT net.http_post(
      url:='https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/send-whatsapp-message',
      headers:='{"Content-Type": "application/json"}'::jsonb
    );
  $$
);
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
  console.log("Cron Setup:", text);
}

run();

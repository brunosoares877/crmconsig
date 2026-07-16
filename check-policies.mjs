import fs from 'fs';

const sql = `
SELECT json_agg(t) FROM (
  SELECT tablename, policyname, cmd, qual, with_check 
  FROM pg_policies 
  WHERE tablename = 'message_queue'
) t;
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
  console.log("Policies:", text);
}

run();

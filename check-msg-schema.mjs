import fs from 'fs';

const sql = `
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'whatsapp_messages';
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
  console.log("Schema:", text);
}

run();

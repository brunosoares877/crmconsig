import fs from 'fs';

const sql = `
SELECT json_agg(t) FROM (
  SELECT
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='message_queue'
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
  console.log("FKs:", text);
}

run();

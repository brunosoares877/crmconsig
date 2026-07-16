import fs from 'fs';

const sql = `
SELECT json_agg(t) FROM (
  SELECT jobid::text, schedule, command, jobname 
  FROM cron.job
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
  console.log("Cron Jobs:", text);
}

run();

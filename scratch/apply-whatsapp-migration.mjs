import fs from 'fs';

const sql = fs.readFileSync('supabase/migrations/20260719000000-optimize-whatsapp-db.sql', 'utf8');

async function run() {
  console.log("Sending WhatsApp optimization SQL to Supabase Edge Function...");
  try {
    const res = await fetch("https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: sql
    });
    
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();

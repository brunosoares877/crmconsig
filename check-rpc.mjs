import fs from 'fs';  
const sql = SELECT prosrc FROM pg_proc WHERE proname = 'can_send_message';;  
async function run() { const res = await fetch('https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql', { method: 'POST', body: sql }); const text = await res.text(); console.log(text); } run();  

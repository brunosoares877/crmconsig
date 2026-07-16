import { createClient } from '@supabase/supabase-js';  
const supabase = createClient('https://wjljrytblpsnzjwvugqg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY');  
async function run() { const {data} = await supabase.from('whatsapp_instances').select('*'); console.log(data); } run();  

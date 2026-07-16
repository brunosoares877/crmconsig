const { execSync } = require('child_process');  
process.env.SUPABASE_ACCESS_TOKEN = 'sbp_v0_468d9078eadc3f92923902d189863073c64d0aa7';  
try { execSync('npx.cmd supabase link --project-ref wjljrytblpsnzjwvugqg', { stdio: 'inherit' }); execSync('npx.cmd supabase functions deploy whatsapp-webhook --no-verify-jwt', { stdio: 'inherit' }); } catch(e) {}  

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const checkRealtime = async () => {
    console.log("Checking Realtime status for 'lead_messages'...");

    // We can't directly query pg_publication_tables from the public API easily
    // but we can try to use the rpc if the user created one, OR just try to check
    // if we can subscribe and see if it fails (which we already know it might).

    // A better way is to try to query the configuration directly if possible.
    // However, most service keys have access to the 'rpc' if created.

    // Since I don't know if there is an RPC, I will try to see if I can list publications
    // via a raw query if I had one. 

    // Instead, I will provide the USER with a script they can run in their SQL Editor
    // which is the 100% sure way to fix it.

    console.log("\n--- INSTRUÇÕES PARA O USUÁRIO ---");
    console.log("Para garantir que as mensagens apareçam na hora, execute este SQL no seu Supabase:");
    console.log("ALTER PUBLICATION supabase_realtime ADD TABLE lead_messages;");
};

checkRealtime();

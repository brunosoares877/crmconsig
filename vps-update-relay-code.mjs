import { Client } from 'ssh2';

const conn = new Client();

const commands = `
cat << 'EOF' > /root/webhook-relay.mjs
import http from 'http';

const SUPABASE_URL = "https://wjljrytblpsnzjwvugqg.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY";

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        console.log('Received payload:', JSON.stringify(payload, null, 2));
        
        // try to forward anyway
        const supRes = await fetch(\`\${SUPABASE_URL}/rest/v1/rpc/handle_whatsapp_webhook\`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'apikey': ANON_KEY,
               'Authorization': \`Bearer \${ANON_KEY}\`
             },
             body: JSON.stringify({ payload })
        });
        if(!supRes.ok) console.error("Supabase Error:", await supRes.text());
        
      } catch(e) { console.error(e) }
      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(200);
    res.end('Relay Alive');
  }
});
server.listen(3000, () => console.log('Relay listening on 3000'));
EOF

docker restart webhook-relay
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '179.197.78.30',
  port: 22,
  username: 'root',
  password: 'Parnamirim21@'
});

import { Client } from 'ssh2';
import fs from 'fs';

const conn = new Client();

const VITE_SUPABASE_URL = "https://wjljrytblpsnzjwvugqg.supabase.co";
const VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY";

const relayCode = `
import http from 'http';

const SUPABASE_URL = "${VITE_SUPABASE_URL}";
const ANON_KEY = "${VITE_SUPABASE_ANON_KEY}";

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        console.log('Received webhook:', payload.event);
        if (payload.event === 'messages.upsert') {
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
        }
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
`;

const commands = `
cat << 'EOF' > /root/webhook-relay.mjs
${relayCode}
EOF

echo "Stop old container..."
docker rm -f webhook-relay || true

echo "Start new container..."
docker run -d --name webhook-relay --network host --restart always -v /root/webhook-relay.mjs:/app/webhook-relay.mjs node:20-alpine node /app/webhook-relay.mjs

echo "Setting Global Webhook in Evolution API..."
curl -X POST http://localhost:8080/webhook/set/meuchipprospeccao \\
  -H "apikey: crmconsig2024secretkey" \\
  -H "Content-Type: application/json" \\
  -d '{
    "webhook": {
      "enabled": true,
      "url": "http://localhost:3000/webhook",
      "webhookByEvents": false,
      "webhookBase64": false,
      "events": ["MESSAGES_UPSERT"]
    }
  }'
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

import { Client } from 'ssh2';

const conn = new Client();

const commands = `
curl -X POST http://localhost:8080/webhook/set/meuchipprospeccao \\
  -H "apikey: crmconsig2024secretkey" \\
  -H "Content-Type: application/json" \\
  -d '{
    "webhook": {
      "enabled": true,
      "url": "http://172.16.1.1:3000/webhook",
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

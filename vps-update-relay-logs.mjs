import { Client } from 'ssh2';

const conn = new Client();

const commands = `
docker exec webhook-relay sed -i 's/console.log(.Received webhook:., payload.event);/console.log(.Received payload:., JSON.stringify(payload));/g' /app/webhook-relay.mjs
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

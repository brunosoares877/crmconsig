import { Client } from 'ssh2';

const conn = new Client();

const commands = `
echo "=== Test curl from host ==="
curl -X POST http://179.197.78.30:3000/webhook -d '{}'

echo -e "\n=== Test curl from inside evolution-api container ==="
docker exec evolution-api curl -s -X POST http://179.197.78.30:3000/webhook -d '{}' || echo "curl failed in container"
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

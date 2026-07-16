import { Client } from 'ssh2';

const conn = new Client();

const commands = `
echo "=== Test curl from inside evolution-api container to 172.16.1.1 ==="
docker exec evolution-api wget -qO- http://172.16.1.1:3000/ || echo "wget failed"
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

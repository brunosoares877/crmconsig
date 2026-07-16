import { Client } from 'ssh2';

const conn = new Client();

const commands = `
curl -s -X DELETE http://localhost:8080/instance/delete/meuchipprospeccao \\
  -H "apikey: crmconsig2024secretkey"
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

import { Client } from 'ssh2';

const conn = new Client();

const commands = `
cat > /opt/evolution/docker-compose.yml << 'DOCKEREOF'
version: '3.8'
services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      SERVER_TYPE: http
      SERVER_PORT: 8080
      SERVER_URL: http://179.197.78.30:8080
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: crmconsig2024secretkey
      DATABASE_PROVIDER: sqlite
      DATABASE_CONNECTION_URI: file:./evolution.db
      QRCODE_LIMIT: 30
      LOG_LEVEL: ERROR
      WEBHOOK_GLOBAL_ENABLED: "true"
    volumes:
      - ./evolution_data:/evolution/store
      - ./evolution_instances:/evolution/instances
DOCKEREOF

cd /opt/evolution
docker compose up -d
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

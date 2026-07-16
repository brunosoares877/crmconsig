import { Client } from 'ssh2';

const conn = new Client();

const commands = `
set -e
echo "=== Liberando Firewall (UFW) ==="
ufw allow 8080/tcp || true
ufw reload || true

echo "=== Liberando Firewall (IPTABLES) ==="
iptables -I INPUT -p tcp --dport 8080 -j ACCEPT || true

echo "=== Atualizando Docker Compose ==="
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
    volumes:
      - ./evolution_data:/evolution/store
      - ./evolution_instances:/evolution/instances
DOCKEREOF

cd /opt/evolution
docker compose pull
docker compose up -d

echo "=== Verificando containers ==="
sleep 5
docker ps
echo "=== Testando porta 8080 localmente no VPS ==="
curl -s http://localhost:8080/ | head -c 100
`;

conn.on('ready', () => {
  console.log('SSH :: Conectado com sucesso!');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('SSH :: Comando concluído com código ' + code);
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

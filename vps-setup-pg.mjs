import { Client } from 'ssh2';

const conn = new Client();

const commands = `
echo "=== Atualizando Docker Compose para usar PostgreSQL ==="
cat > /opt/evolution/docker-compose.yml << 'DOCKEREOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: evolution-postgres
    restart: always
    environment:
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: evolutionpassword
      POSTGRES_DB: evolution
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
      
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      SERVER_TYPE: http
      SERVER_PORT: 8080
      SERVER_URL: http://179.197.78.30:8080
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: crmconsig2024secretkey
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://evolution:evolutionpassword@postgres:5432/evolution?schema=public
      QRCODE_LIMIT: 30
      LOG_LEVEL: ERROR
    volumes:
      - ./evolution_instances:/evolution/instances
DOCKEREOF

cd /opt/evolution
docker compose down
docker compose up -d

echo "=== Aguardando inicialização ==="
sleep 15
docker ps
echo "=== Testando API ==="
curl -s http://localhost:8080/ | head -c 100
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

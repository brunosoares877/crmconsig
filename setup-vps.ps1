$VPS_IP = "179.197.78.30"
$VPS_USER = "root"
$VPS_PASS = "Parnamirim21@"

# Comandos para executar no VPS
$COMMANDS = @"
set -e
echo "=== Verificando Docker ==="
docker --version
docker compose version 2>/dev/null || docker-compose --version

echo "=== Criando pasta /opt/evolution ==="
mkdir -p /opt/evolution
cd /opt/evolution

echo "=== Criando docker-compose.yml ==="
cat > /opt/evolution/docker-compose.yml << 'DOCKEREOF'
version: '3.8'
services:
  evolution-api:
    image: atendai/evolution-api:latest
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

echo "=== Subindo Evolution API ==="
cd /opt/evolution
docker compose up -d

echo "=== Aguardando inicializar ==="
sleep 8

echo "=== Status dos containers ==="
docker ps

echo "=== Testando API ==="
curl -s http://localhost:8080/ | head -c 200

echo "=== CONFIGURACAO COMPLETA ==="
"@

# Usar Plink (PuTTY) se disponível, senão instruções manuais
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue
if ($plinkPath) {
    Write-Host "Usando plink para conectar..."
    echo y | plink -ssh -pw $VPS_PASS "$VPS_USER@$VPS_IP" $COMMANDS
} else {
    Write-Host "plink nao encontrado. Tentando via SSH nativo com expect..."
    # Criar arquivo de senha temporário
    $tempScript = "$env:TEMP\vps_setup.sh"
    $COMMANDS | Out-File -FilePath $tempScript -Encoding UTF8
    
    # Tentar SSH direto (vai pedir senha manualmente se não tiver chave)
    Write-Host "Conectando em $VPS_USER@$VPS_IP..."
    Write-Host "Se pedir senha, use: $VPS_PASS"
    ssh -o StrictHostKeyChecking=no -o PasswordAuthentication=yes "$VPS_USER@$VPS_IP" $COMMANDS
}

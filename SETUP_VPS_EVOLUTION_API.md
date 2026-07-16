# 🚀 Instalação da Evolution API no VPS Hostinger (KVM 1)

## Pré-requisitos
- VPS Hostinger KVM 1 já contratado
- Ubuntu 22.04 com Docker instalado (selecionado no painel Hostinger)
- Acesso SSH ao servidor

---

## Passo 1 — Acesso SSH

No seu computador (Windows), abra o PowerShell:

```powershell
ssh root@SEU_IP_AQUI
```

Se precisar de chave SSH:
```powershell
ssh -i ~/.ssh/id_rsa root@SEU_IP_AQUI
```

---

## Passo 2 — Verificar Docker

```bash
docker --version
docker compose version
```

Se não instalado:
```bash
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y
```

---

## Passo 3 — Criar pasta e arquivos

```bash
mkdir -p /opt/evolution
cd /opt/evolution
```

Crie o arquivo `docker-compose.yml`:

```bash
nano docker-compose.yml
```

Cole o conteúdo abaixo:

```yaml
version: '3.8'

services:
  evolution-api:
    image: evoapicloud/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      # ─── Configuração Geral ───────────────────────────────────────
      SERVER_TYPE: http
      SERVER_PORT: 8080
      SERVER_URL: http://SEU_IP_AQUI:8080   # ← Substitua pelo seu IP
      
      # ─── Autenticação ─────────────────────────────────────────────
      # IMPORTANTE: Troque essa chave por uma string aleatória segura!
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: MINHA_CHAVE_SUPER_SECRETA_AQUI
      
      # ─── Banco de Dados (SQLite embutido) ─────────────────────────
      DATABASE_PROVIDER: sqlite
      DATABASE_CONNECTION_URI: file:./evolution.db
      
      # ─── WhatsApp ─────────────────────────────────────────────────
      WA_BUSINESS_TOKEN_WEBHOOK: false
      QRCODE_LIMIT: 30
      QRCODE_COLOR: '#198754'
      
      # ─── Logs ─────────────────────────────────────────────────────
      LOG_LEVEL: ERROR
      LOG_COLOR: true
      
      # ─── Webhook para o Supabase ──────────────────────────────────
      # URL da sua Edge Function no Supabase
      # Preencha depois de fazer o deploy das Functions no Supabase
      # WEBHOOK_GLOBAL_URL: https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/whatsapp-webhook
      # WEBHOOK_GLOBAL_ENABLED: false
      
    volumes:
      - ./evolution_data:/evolution/store
      - ./evolution_instances:/evolution/instances
```

Salvar: `Ctrl+X` → `Y` → `Enter`

---

## Passo 4 — Subir a Evolution API

```bash
cd /opt/evolution
docker compose up -d
```

Verificar se está rodando:
```bash
docker ps
docker logs evolution-api --tail=50
```

---

## Passo 5 — Testar acesso

No seu navegador ou Postman:
```
GET http://SEU_IP:8080/
```

Deve retornar:
```json
{"status": 200, "message": "Welcome to the Evolution API..."}
```

---

## Passo 6 — Configurar no CRM

1. Acesse o CRM em `http://localhost:5173/whatsapp/connect`
2. Clique em **Nova Instância**
3. Preencha:
   - **Nome**: `chip-prospeccao` (ou qualquer nome)
   - **URL da API**: `http://SEU_IP:8080`
   - **API Key**: `MINHA_CHAVE_SUPER_SECRETA_AQUI` (a que definiu no docker-compose)
   - **Data de ativação do chip**: quando o chip foi comprado/ativado
4. Clique **Criar Instância**
5. Clique em **Conectar via QR Code**
6. Escaneie o QR com o WhatsApp do chip de prospecção

---

## Passo 7 — Configurar Webhook no Supabase

Após fazer o deploy das Edge Functions no Supabase:

1. Acesse o painel do Supabase → **Edge Functions** → **Deploy** as 3 funções:
   - `validate-whatsapp`
   - `send-whatsapp-message`
   - `whatsapp-webhook`

2. A URL do webhook será:
   ```
   https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/whatsapp-webhook
   ```

3. Edite o docker-compose no VPS para ativar o webhook global:
   ```bash
   nano /opt/evolution/docker-compose.yml
   ```
   Descomente e preencha:
   ```yaml
   WEBHOOK_GLOBAL_URL: https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/whatsapp-webhook
   WEBHOOK_GLOBAL_ENABLED: true
   ```

4. Reinicie:
   ```bash
   docker compose restart
   ```

---

## Comandos Úteis

```bash
# Ver logs em tempo real
docker logs -f evolution-api

# Reiniciar a API
docker compose restart

# Parar tudo
docker compose down

# Atualizar para nova versão
docker compose pull
docker compose up -d

# Ver uso de recursos
docker stats evolution-api
```

---

## Firewall (Importante!)

Liberar apenas a porta 8080 para o IP do seu provedor Supabase:

```bash
# Instalar UFW se não tiver
apt install ufw -y

# Liberar SSH (IMPORTANTE: faça isso primeiro!)
ufw allow 22

# Liberar porta da Evolution API
ufw allow 8080

# Ativar firewall
ufw enable
```

---

## Migração SQL no Supabase

Execute o arquivo `supabase/migrations/20240120_whatsapp_prospecting.sql` no:
- Painel do Supabase → **SQL Editor** → Cole o conteúdo do arquivo e execute

---

## Deploy das Edge Functions no Supabase

```bash
# Na pasta do projeto, com Supabase CLI instalado:
npx supabase functions deploy validate-whatsapp --project-ref wjljrytblpsnzjwvugqg
npx supabase functions deploy send-whatsapp-message --project-ref wjljrytblpsnzjwvugqg
npx supabase functions deploy whatsapp-webhook --project-ref wjljrytblpsnzjwvugqg
```

Ou pelo painel em: https://supabase.com/dashboard/project/wjljrytblpsnzjwvugqg/functions

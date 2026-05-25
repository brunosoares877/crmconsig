# 🚀 Script de Deploy Automatizado - CRM Consig (Windows)
# Autor: Assistente IA
# Versão: 1.0

Write-Host "🚀 Iniciando deploy do CRM Consig..." -ForegroundColor Cyan

# Função para verificar se comando existe
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Verificar dependências
Write-Host "🔍 Verificando dependências..." -ForegroundColor Blue

if (-not (Test-Command "npm")) {
    Write-Host "❌ NPM não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "vercel")) {
    Write-Host "⚠️  Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json não encontrado. Execute este script na raiz do projeto." -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
npm install

# Fazer build
Write-Host "🔨 Fazendo build do projeto..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou. Verifique os erros acima." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green

# Deploy no Vercel
Write-Host "🚀 Fazendo deploy no Vercel..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🎉 Seu CRM está online!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Configure seu domínio personalizado no painel do Vercel"
    Write-Host "2. Adicione as variáveis de ambiente do Supabase"
    Write-Host "3. Teste todas as funcionalidades"
    Write-Host ""
    Write-Host "🔗 Acesse: https://vercel.com/dashboard" -ForegroundColor Blue
} else {
    Write-Host "❌ Deploy falhou. Verifique os erros acima." -ForegroundColor Red
    exit 1
} 
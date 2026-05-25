#!/usr/bin/env pwsh

# Script para corrigir a constraint de status da tabela commissions
# Executa a migração pendente

Write-Host "🔧 Executando correção da constraint de comissões..." -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório supabase
Set-Location -Path "supabase"

# Executar o push das migrações
Write-Host "📊 Aplicando migração..." -ForegroundColor Yellow
npx supabase db push

# Voltar para o diretório raiz
Set-Location -Path ".."

Write-Host ""
Write-Host "✅ Migração concluída!" -ForegroundColor Green
Write-Host "Agora você pode gerar comissões sem erro." -ForegroundColor Green 
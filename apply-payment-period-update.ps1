#!/usr/bin/env pwsh

# Script para aplicar migração de atualização do payment_period
# Atualiza constraint para aceitar valores de 1 a 999 parcelas

Write-Host "Aplicando migração para atualizar payment_period range..." -ForegroundColor Green

# Verificar se Supabase CLI está instalado
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI não encontrado. Instale com: npm install -g supabase" -ForegroundColor Red
    exit 1
}

# Aplicar migração
Write-Host "Executando migração: 20250128000000-update-payment-period-range.sql" -ForegroundColor Yellow

try {
    supabase db push
    Write-Host "Migração aplicada com sucesso!" -ForegroundColor Green
    Write-Host "Agora você pode usar prazos de 1x a 999x!" -ForegroundColor Cyan
} catch {
    Write-Host "Erro ao aplicar migração: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tente executar o SQL manualmente no Supabase Dashboard" -ForegroundColor Yellow
}

Write-Host "Para verificar se funcionou, teste criando um lead com prazo personalizado" -ForegroundColor Blue 
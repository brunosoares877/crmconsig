#!/usr/bin/env powershell

# Script para aplicar a migracao de commission_config

Write-Host "Aplicando migracao de commission_config..." -ForegroundColor Green

# Verificar se o arquivo de migracao existe
$migrationFile = "supabase/migrations/20250131000000-add-commission-config-to-leads.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "Arquivo de migracao nao encontrado: $migrationFile" -ForegroundColor Red
    exit 1
}

# Ler o conteudo da migracao
$migrationContent = Get-Content $migrationFile -Raw

Write-Host "Conteudo da migracao:" -ForegroundColor Yellow
Write-Host $migrationContent -ForegroundColor Cyan

Write-Host ""
Write-Host "Para aplicar esta migracao:" -ForegroundColor Green
Write-Host "1. Acesse o Supabase Dashboard" -ForegroundColor White
Write-Host "2. Va para SQL Editor" -ForegroundColor White
Write-Host "3. Cole o conteudo acima" -ForegroundColor White
Write-Host "4. Execute o SQL" -ForegroundColor White

Write-Host ""
Write-Host "Ou execute diretamente via CLI:" -ForegroundColor Green
Write-Host "supabase migration up" -ForegroundColor Cyan

Write-Host ""
Write-Host "Migracao preparada com sucesso!" -ForegroundColor Green

# Copiar para clipboard se disponivel
try {
    $migrationContent | Set-Clipboard
    Write-Host "Conteudo copiado para a area de transferencia!" -ForegroundColor Green
} catch {
    Write-Host "Nao foi possivel copiar para a area de transferencia" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Apos aplicar a migracao, o sistema estara pronto para usar configuracoes de comissao!" -ForegroundColor Green 
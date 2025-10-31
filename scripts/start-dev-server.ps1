# Script para iniciar o servidor de desenvolvimento em background
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green

# Navegar para o diretório do projeto
Set-Location $PSScriptRoot\..

# Verificar se há um processo Node rodando na porta 8080
$port = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "Porta 8080 já está em uso. Tentando outras portas..." -ForegroundColor Yellow
}

# Iniciar o servidor em uma nova janela PowerShell minimizada
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized

Write-Host "Servidor iniciado em background!" -ForegroundColor Green
Write-Host "Acesse: http://localhost:8080 (ou verifique a porta no terminal aberto)" -ForegroundColor Cyan
Write-Host "Para parar o servidor, feche a janela PowerShell minimizada ou use: Get-Process -Name node | Stop-Process" -ForegroundColor Gray


# Script para iniciar o servidor de desenvolvimento de forma confiável
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Preparando ambiente..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node antigos que possam estar usando a porta
Write-Host "Parando processos Node antigos..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  Processos Node parados." -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Verificar se a porta 5173 está livre
Write-Host "Verificando porta 5173..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "  Porta em uso, aguardando liberacao..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Iniciando servidor em nova janela..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Obter o diretório do script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Criar um script temporário para iniciar o servidor
$tempScript = Join-Path $scriptDir "temp-start-server.ps1"
@"
Write-Host 'Servidor Vite iniciando...' -ForegroundColor Green
Write-Host ''
Set-Location '$scriptDir'
npm run dev
"@ | Out-File -FilePath $tempScript -Encoding UTF8 -Force

# Iniciar em nova janela PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$tempScript`""

# Aguardar o servidor iniciar
Write-Host "Aguardando servidor iniciar..." -ForegroundColor Cyan
$maxAttempts = 20
$attempt = 0
$serverReady = $false

for ($i = 1; $i -le $maxAttempts; $i++) {
    Start-Sleep -Seconds 2
    $connection = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $serverReady = $true
        break
    }
    Write-Host "  Aguardando... ($i/$maxAttempts)" -ForegroundColor Gray
}

Write-Host ""
if ($serverReady) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Servidor iniciado com sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Abrindo navegador..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:5173"
    Write-Host ""
    Write-Host "Servidor rodando em: http://localhost:5173" -ForegroundColor Green
    Write-Host "O servidor esta rodando em uma janela separada." -ForegroundColor Yellow
    Write-Host "Feche aquela janela para parar o servidor." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  Servidor pode estar ainda iniciando" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Abrindo navegador mesmo assim..." -ForegroundColor Cyan
    Start-Process "http://localhost:5173"
    Write-Host ""
    Write-Host "Se nao carregar, aguarde alguns segundos e recarregue." -ForegroundColor Yellow
    Write-Host "Verifique a janela do servidor que foi aberta." -ForegroundColor Yellow
    Write-Host ""
}

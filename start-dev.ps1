# Script para iniciar o servidor de desenvolvimento de forma confiável
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan

# Parar processos Node antigos que possam estar usando a porta
Write-Host "🛑 Parando processos Node antigos..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Verificar se a porta 5173 está livre
$portInUse = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Porta 5173 ainda em uso, aguardando liberação..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Iniciar o servidor em background
Write-Host "▶️  Iniciando servidor Vite..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

# Aguardar o servidor iniciar (verificar a cada 2 segundos por até 30 segundos)
Write-Host "⏳ Aguardando servidor iniciar..." -ForegroundColor Cyan
$maxAttempts = 15
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $attempt++
    $connection = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        $serverReady = $true
        Write-Host "✅ Servidor rodando na porta 5173!" -ForegroundColor Green
    } else {
        Write-Host "   Tentativa $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if ($serverReady) {
    Write-Host "🌐 Abrindo navegador..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:5173"
    Write-Host "✨ Pronto! Servidor iniciado e navegador aberto." -ForegroundColor Green
} else {
    Write-Host "⚠️  Servidor pode estar ainda iniciando. Abrindo navegador mesmo assim..." -ForegroundColor Yellow
    Start-Process "http://localhost:5173"
    Write-Host "💡 Se não carregar, aguarde alguns segundos e recarregue a página." -ForegroundColor Yellow
}


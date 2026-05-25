# Script para limpar processos Node antigos e iniciar servidor limpo
Write-Host "Limpando processos Node antigos..." -ForegroundColor Yellow

# Parar todos os processos Node relacionados ao projeto
Get-Process -Name node -ErrorAction SilentlyContinue | 
    Where-Object { $_.Path -like "*crmconsig*" -or $_.StartTime -lt (Get-Date).AddMinutes(-10) } | 
    Stop-Process -Force -ErrorAction SilentlyContinue

# Aguardar um momento
Start-Sleep -Seconds 2

Write-Host "Processos limpos!" -ForegroundColor Green

# Verificar portas em uso
$ports = @(8080, 8081, 8082, 8083, 5173)
Write-Host "`nVerificando portas..." -ForegroundColor Cyan
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "Porta $port está em uso pelo processo $($connection.OwningProcess)" -ForegroundColor Yellow
    }
}

Write-Host "`nIniciando servidor de desenvolvimento..." -ForegroundColor Green
Set-Location $PSScriptRoot\..

# Iniciar servidor em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Servidor de Desenvolvimento - NÃO FECHE ESTA JANELA' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host "`nServidor iniciado!" -ForegroundColor Green
Write-Host "Uma nova janela PowerShell foi aberta com o servidor." -ForegroundColor Cyan
Write-Host "IMPORTANTE: Não feche a janela do servidor enquanto estiver desenvolvendo!" -ForegroundColor Yellow
Write-Host "`nAguardando servidor inicializar..." -ForegroundColor Gray

# Aguardar servidor iniciar
Start-Sleep -Seconds 5

# Tentar encontrar a porta
$activePort = $null
foreach ($port in @(8080, 8081, 8082, 8083, 5173)) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $activePort = $port
        break
    }
}

if ($activePort) {
    Write-Host "`n✅ Servidor rodando na porta $activePort" -ForegroundColor Green
    Write-Host "Acesse: http://localhost:$activePort" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Verifique a janela do servidor para ver qual porta foi usada" -ForegroundColor Yellow
}


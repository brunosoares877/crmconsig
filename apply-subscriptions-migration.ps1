# Script para aplicar a migration de subscriptions no Supabase
# Execute este script apos copiar o SQL para o Supabase Dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  APLICAR MIGRATION: Subscriptions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "INSTRUCOES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Selecione o projeto: wjljrytblpsnzjwvugqg" -ForegroundColor White
Write-Host "3. Va em: SQL Editor" -ForegroundColor White
Write-Host "4. Clique em: New Query" -ForegroundColor White
Write-Host "5. Cole o conteudo do arquivo:" -ForegroundColor White
Write-Host "   supabase/migrations/20250131120000-create-subscriptions-table.sql" -ForegroundColor Green
Write-Host "6. Clique em: Run" -ForegroundColor White
Write-Host ""

Write-Host "Abrindo arquivo da migration..." -ForegroundColor Cyan
$migrationPath = Join-Path $PSScriptRoot "supabase\migrations\20250131120000-create-subscriptions-table.sql"

if (Test-Path $migrationPath) {
    # Copiar conteudo para clipboard
    Get-Content $migrationPath -Raw | Set-Clipboard
    Write-Host "Conteudo copiado para a area de transferencia!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cole (Ctrl+V) no SQL Editor do Supabase e execute." -ForegroundColor Yellow
    
    # Abrir arquivo no editor padrao
    Start-Process $migrationPath
} else {
    Write-Host "Arquivo de migration nao encontrado!" -ForegroundColor Red
    Write-Host "   Caminho esperado: $migrationPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Link direto para SQL Editor:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/wjljrytblpsnzjwvugqg/sql/new" -ForegroundColor Blue
Write-Host ""

Write-Host "Pressione qualquer tecla apos aplicar a migration..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Migration aplicada com sucesso!" -ForegroundColor Green
Write-Host ""

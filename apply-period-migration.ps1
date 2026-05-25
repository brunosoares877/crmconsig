#!/usr/bin/env pwsh

# Script para aplicar migração completa dos campos de comissão
# Este script adiciona TODAS as colunas faltantes: commission_type, fixed_value, min_period, max_period e tier_type

Write-Host "🔧 Aplicando migração completa para comissões por valor e prazo..." -ForegroundColor Yellow

try {
    # Navegar para o diretório do Supabase
    Set-Location "supabase"
    
    # Aplicar a migração
    Write-Host "📊 Executando migração..." -ForegroundColor Cyan
    npx supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migração aplicada com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Agora você pode configurar comissões por prazo de pagamento!" -ForegroundColor Green
        Write-Host "   - 8x a 12x: uma taxa"
        Write-Host "   - 13x a 24x: outra taxa"
        Write-Host "   - 25x a 36x: outra taxa"
        Write-Host ""
        Write-Host "📖 Acesse: Comissões → Configurar Taxas → Taxas Variáveis" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro ao aplicar migração" -ForegroundColor Red
        Write-Host "🔧 Tente executar manualmente: cd supabase && npx supabase db push" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔧 Certifique-se de estar no diretório raiz do projeto" -ForegroundColor Yellow
}

# Voltar ao diretório raiz
Set-Location ".."

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
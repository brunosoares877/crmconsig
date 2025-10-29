# Script para fazer commit das alterações
# Execute este script quando o Git estiver disponível

Write-Host "🔄 Preparando commit das alterações..." -ForegroundColor Cyan

# Verificar se Git está disponível
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Instale Git primeiro." -ForegroundColor Red
    Write-Host "💡 Download: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verificar se estamos em um repositório Git
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Este diretório não é um repositório Git." -ForegroundColor Yellow
    Write-Host "💡 Execute: git init" -ForegroundColor Yellow
    exit 1
}

# Verificar status
Write-Host "`n📊 Status do repositório:" -ForegroundColor Cyan
git status --short

# Adicionar todos os arquivos
Write-Host "`n➕ Adicionando arquivos ao stage..." -ForegroundColor Cyan
git add .

# Fazer commit
Write-Host "`n💾 Fazendo commit..." -ForegroundColor Cyan
git commit -m "feat: adicionar email vitalício, corrigir reset password, performance funcionários e criação automática de comissão

- Adicionar solutioninveste@gmail.com como plano vitalício
- Corrigir rota /reset-password no App.tsx
- Melhorar tratamento de tokens de recuperação de senha
- Corrigir exibição de nome do funcionário no ranking de performance
- Corrigir salvamento do campo funcionário ao editar lead
- Implementar criação automática de comissão ao marcar lead como concluído
- Redirecionar para página de comissões após criar comissão"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Commit realizado com sucesso!" -ForegroundColor Green
    Write-Host "`n💡 Para fazer push:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Erro ao fazer commit" -ForegroundColor Red
    exit 1
}


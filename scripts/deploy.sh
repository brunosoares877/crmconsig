#!/bin/bash

# 🚀 Script de Deploy Automatizado - CRM Consig
# Autor: Assistente IA
# Versão: 1.0

echo "🚀 Iniciando deploy do CRM Consig..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não está instalado${NC}"
        return 1
    fi
    return 0
}

# Verificar dependências
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

if ! check_command "npm"; then
    echo -e "${RED}❌ NPM não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

if ! check_command "vercel"; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json não encontrado. Execute este script na raiz do projeto.${NC}"
    exit 1
fi

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

# Fazer build
echo -e "${BLUE}🔨 Fazendo build do projeto...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou. Verifique os erros acima.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"

# Deploy no Vercel
echo -e "${BLUE}🚀 Fazendo deploy no Vercel...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
    echo -e "${GREEN}🎉 Seu CRM está online!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo "1. Configure seu domínio personalizado no painel do Vercel"
    echo "2. Adicione as variáveis de ambiente do Supabase"
    echo "3. Teste todas as funcionalidades"
    echo ""
    echo -e "${BLUE}🔗 Acesse: https://vercel.com/dashboard${NC}"
else
    echo -e "${RED}❌ Deploy falhou. Verifique os erros acima.${NC}"
    exit 1
fi 
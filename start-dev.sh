#!/bin/bash
# AI_GENERATED_CODE_START
# [AI Generated] Data: 19/03/2024
# Descrição: Script para iniciar ambiente de desenvolvimento BudgetBuddy
# Gerado por: Cursor AI
# Versão: Bash

echo "🚀 Iniciando BudgetBuddy em modo desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Verificar se o arquivo docker-compose.dev.yml existe
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ Arquivo docker-compose.dev.yml não encontrado."
    exit 1
fi

echo "📦 Construindo e iniciando containers..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ BudgetBuddy iniciado com sucesso!"
echo "🌐 Acesse: http://localhost:5000"
echo ""
echo "📋 Comandos úteis:"
echo "  - Parar: docker-compose -f docker-compose.dev.yml down"
echo "  - Logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  - Rebuild: docker-compose -f docker-compose.dev.yml up --build"
# AI_GENERATED_CODE_END 
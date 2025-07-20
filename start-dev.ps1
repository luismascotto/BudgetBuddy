# AI_GENERATED_CODE_START
# [AI Generated] Data: 19/03/2024
# Descrição: Script PowerShell para iniciar ambiente de desenvolvimento BudgetBuddy
# Gerado por: Cursor AI
# Versão: PowerShell 7

Write-Host "🚀 Iniciando BudgetBuddy em modo desenvolvimento..." -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o arquivo docker-compose.dev.yml existe
if (-not (Test-Path "docker-compose.dev.yml")) {
    Write-Host "❌ Arquivo docker-compose.dev.yml não encontrado." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "📦 Construindo e iniciando containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up --build

Write-Host "✅ BudgetBuddy iniciado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Acesse: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor White
Write-Host "  - Parar: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host "  - Logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Gray
Write-Host "  - Rebuild: docker-compose -f docker-compose.dev.yml up --build" -ForegroundColor Gray
# AI_GENERATED_CODE_END 
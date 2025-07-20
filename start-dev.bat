@echo off
REM AI_GENERATED_CODE_START
REM [AI Generated] Data: 19/03/2024
REM Descrição: Script Windows para iniciar ambiente de desenvolvimento BudgetBuddy
REM Gerado por: Cursor AI
REM Versão: Windows Batch

echo 🚀 Iniciando BudgetBuddy em modo desenvolvimento...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)

REM Verificar se o arquivo docker-compose.dev.yml existe
if not exist "docker-compose.dev.yml" (
    echo ❌ Arquivo docker-compose.dev.yml não encontrado.
    pause
    exit /b 1
)

echo 📦 Construindo e iniciando containers...
docker-compose -f docker-compose.dev.yml up --build

echo ✅ BudgetBuddy iniciado com sucesso!
echo 🌐 Acesse: http://localhost:5000
echo.
echo 📋 Comandos úteis:
echo   - Parar: docker-compose -f docker-compose.dev.yml down
echo   - Logs: docker-compose -f docker-compose.dev.yml logs -f
echo   - Rebuild: docker-compose -f docker-compose.dev.yml up --build
pause
REM AI_GENERATED_CODE_END 
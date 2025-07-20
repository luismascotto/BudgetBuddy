# AI_GENERATED_CODE_START
# [AI Generated] Data: 19/03/2024
# Descrição: README com instruções para executar BudgetBuddy localmente com Docker
# Gerado por: Cursor AI
# Versão: Docker Compose v2, PostgreSQL 15

# BudgetBuddy - Local Development Setup

Este guia explica como configurar e executar o projeto BudgetBuddy localmente usando Docker.

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)
- [Git](https://git-scm.com/) (para clonar o repositório)

## 🚀 Configuração Rápida

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd BudgetBuddy
```

### 2. Execute o projeto em modo desenvolvimento
```bash
# Usando Docker Compose para desenvolvimento
docker-compose -f docker-compose.dev.yml up --build
```

### 3. Acesse a aplicação
Abra seu navegador e acesse: http://localhost:5000

## 🔧 Configurações Detalhadas

### Estrutura do Projeto
```
BudgetBuddy/
├── client/                 # Frontend React + Vite
├── server/                 # Backend Express.js
├── shared/                 # Schema compartilhado
├── docker-compose.dev.yml  # Docker Compose para desenvolvimento
├── docker-compose.yml      # Docker Compose para produção
├── Dockerfile.dev          # Dockerfile para desenvolvimento
├── Dockerfile             # Docker Compose para produção
├── init-db.sql           # Script de inicialização do banco
└── .dockerignore         # Arquivos ignorados no build
```

### Serviços Docker

#### 1. PostgreSQL Database
- **Porta**: 5432
- **Database**: budgetbuddy
- **Usuário**: budgetbuddy
- **Senha**: budgetbuddy123
- **Persistência**: Volume `postgres_data_dev`

#### 2. BudgetBuddy Application
- **Porta**: 5000
- **Modo**: Desenvolvimento com hot reload
- **Volumes**: Código fonte montado para desenvolvimento

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Executar em background
docker-compose -f docker-compose.dev.yml up -d

# Parar serviços
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f app

# Acessar container da aplicação
docker exec -it budgetbuddy-app-dev sh

# Acessar banco de dados
docker exec -it budgetbuddy-db-dev psql -U budgetbuddy -d budgetbuddy
```

### Produção
```bash
# Iniciar em modo produção
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar serviços
docker-compose down
```

### Manutenção do Banco de Dados
```bash
# Executar migrações
docker exec -it budgetbuddy-app-dev npm run db:push

# Backup do banco
docker exec -it budgetbuddy-db-dev pg_dump -U budgetbuddy budgetbuddy > backup.sql

# Restaurar backup
docker exec -i budgetbuddy-db-dev psql -U budgetbuddy -d budgetbuddy < backup.sql
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Porta 5000 já está em uso
```bash
# Verificar processos na porta
netstat -tulpn | grep :5000

# Parar processo específico
sudo kill -9 <PID>
```

#### 2. Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f docker-compose.dev.yml ps

# Reiniciar apenas o banco
docker-compose -f docker-compose.dev.yml restart postgres
```

#### 3. Problemas de permissão no Docker
```bash
# No Windows, certifique-se de que o Docker Desktop está rodando
# No Linux/Mac, adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER
```

#### 4. Limpar dados e recomeçar
```bash
# Parar e remover volumes
docker-compose -f docker-compose.dev.yml down -v

# Remover imagens
docker rmi budgetbuddy_app-dev

# Reconstruir do zero
docker-compose -f docker-compose.dev.yml up --build
```

## 📊 Monitoramento

### Logs em Tempo Real
```bash
# Logs da aplicação
docker-compose -f docker-compose.dev.yml logs -f app

# Logs do banco
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Status dos Containers
```bash
# Ver status
docker-compose -f docker-compose.dev.yml ps

# Ver uso de recursos
docker stats
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente:

- `DATABASE_URL`: postgresql://budgetbuddy:budgetbuddy123@postgres:5432/budgetbuddy
- `NODE_ENV`: development
- `PORT`: 5000

## 📝 Desenvolvimento

### Estrutura de Desenvolvimento
- **Hot Reload**: Ative para frontend e backend
- **Volumes**: Código fonte montado para desenvolvimento
- **Database**: PostgreSQL com dados persistentes
- **Networking**: Rede isolada entre containers

### Fluxo de Desenvolvimento
1. Faça alterações no código
2. Salve o arquivo
3. O hot reload detectará as mudanças
4. A aplicação será reiniciada automaticamente

## 🚀 Deploy

Para deploy em produção, use:
```bash
docker-compose up --build
```

## 📚 Recursos Adicionais

- [Documentação do Docker](https://docs.docker.com/)
- [Documentação do Docker Compose](https://docs.docker.com/compose/)
- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
# AI_GENERATED_CODE_END 
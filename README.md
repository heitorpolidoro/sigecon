# SIGECON - Sistema de Gestão de Controle de Tarefas

Este projeto é uma aplicação web desenvolvida para gerenciar tarefas, permitindo a criação, atribuição, acompanhamento de status e auditoria de alterações.

## Tecnologias Utilizadas

### Backend
*   **Linguagem:** Python 3.14
*   **Framework:** FastAPI
*   **ORM:** SQLModel (com SQLAlchemy)
*   **Banco de Dados:** PostgreSQL
*   **Gerenciador de Pacotes:** uv
*   **Containerização:** Docker

### Frontend
*   **Framework:** React (TypeScript)
*   **Build Tool:** Vite
*   **Estilização:** CSS Modules

## Estrutura do Projeto

O projeto segue uma estrutura modular com separação clara entre frontend e backend, utilizando Docker Compose para orquestração.

## Configurações do Ambiente

As configurações do ambiente (banco de dados, chaves secretas, etc.) devem ser definidas no arquivo `.env`.

## Execução

### Backend
Para rodar o backend, utilize o Docker Compose:
```bash
docker-compose up --build backend
```

### Frontend
Para rodar o frontend:
```bash
docker-compose up frontend
```

## Contribuição e Fluxo de Trabalho

Este projeto segue um fluxo de trabalho com Git, branch de features (`feat/`), commits descritivos e Pull Requests para revisão e merge na branch principal (`master`).

## Segurança

O projeto implementa autenticação via JWT e controle de acesso baseado em roles (RBAC) para Diretores e Funcionários. Credenciais sensíveis devem ser gerenciadas via variáveis de ambiente e arquivo `.env`.

## Quality Assurance

O projeto conta com testes unitários e de integração para o backend, e está configurado para suportar testes frontend e E2E. Workflows de CI/GitHub Actions estão preparados para validação automática.

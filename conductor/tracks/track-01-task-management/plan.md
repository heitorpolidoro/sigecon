# Implementation Plan: Track 01 - Task Management (Gestão de Tarefas)

Este documento detalha a estratégia de implementação para o módulo de Gestão de Tarefas, garantindo que os requisitos de visibilidade, histórico e facilidade de uso sejam atendidos utilizando a tech stack definida.

## 1. Proposed Architecture

O módulo será construído seguindo uma arquitetura de camadas clara:
- **Backend:** FastAPI com SQLModel (SQLAlchemy + Pydantic) para garantir tipagem ponta-a-ponta e persistência no PostgreSQL.
- **Frontend:** React (TypeScript) com React Query para sincronização de estado e gestão de cache.
- **Comunicação:** REST API pura sobre HTTPS com autenticação via JWT Bearer Token. **Nota:** Não utilizaremos WebSockets; a atualização de dados será gerida por polling inteligente no cliente.

## 2. Data Schema (Database Architecture)

Utilizaremos o PostgreSQL para persistência. O foco está na rastreabilidade e integridade dos dados.

### 2.1. Tabelas e Relacionamentos

#### Tabela: `tasks`
Armazena o estado atual de cada tarefa.
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `title` | VARCHAR(255) | Título conciso da tarefa. |
| `description` | TEXT | Detalhamento do que deve ser feito. |
| `status` | ENUM | PENDING, IN_PROGRESS, COMPLETED, CANCELED. |
| `priority` | ENUM | LOW, MEDIUM, HIGH, URGENT. |
| `assigned_to_id` | UUID (FK) | Usuário responsável pela execução. |
| `created_by_id` | UUID (FK) | Usuário que criou a tarefa (Diretor). |
| `due_date` | TIMESTAMP | Data limite para conclusão. |
| `created_at` | TIMESTAMP | Data de criação. |
| `updated_at` | TIMESTAMP | Data da última alteração. |

#### Tabela: `task_history`
Log de auditoria para todas as mudanças em tarefas.
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | BIGINT (PK) | ID sequencial. |
| `task_id` | UUID (FK) | Referência à tarefa. |
| `changed_by_id` | UUID (FK) | Usuário que realizou a mudança. |
| `field_name` | VARCHAR(50) | Nome do campo alterado (ex: 'status'). |
| `old_value` | TEXT | Valor antes da alteração. |
| `new_value` | TEXT | Novo valor após a alteração. |
| `timestamp` | TIMESTAMP | Momento da alteração. |

**Relacionamentos:**
- Uma `task` possui N `task_history`.
- Uma `task` pertence a um `created_by` (User) e um `assigned_to` (User).

## 3. API Endpoints (FastAPI)

Os endpoints seguirão o padrão RESTful, com validação rigorosa via Pydantic.

- `GET /api/v1/tasks`: Lista tarefas com filtros (`status`, `assigned_to`, `search`).
- `POST /api/v1/tasks`: Cria uma nova tarefa (Apenas Diretores).
- `GET /api/v1/tasks/{id}`: Detalhes completos de uma tarefa específica.
- `PATCH /api/v1/tasks/{id}`: Atualiza campos da tarefa (status, descrição, etc). Dispara trigger/lógica para `task_history`.
- `GET /api/v1/tasks/{id}/history`: Retorna a linha do tempo de alterações da tarefa.

## 4. Frontend Components (React)

A interface será focada em simplicidade (KISS) e mobile-first, utilizando **React Query (TanStack Query)** para garantir o "frescor" dos dados sem necessidade de WebSockets.

### 4.1. Estratégia de Sincronização
- **Polling Inteligente:** Utilizaremos `refetchInterval` (ex: 30s ou 1min) em queries críticas (como a lista de tarefas pendentes) para atualizar a UI automaticamente.
- **Cache Management:** Aproveitaremos o `staleTime` para evitar chamadas de rede desnecessárias ao navegar entre abas.
- **Invalidation:** Ao realizar uma mutação (ex: atualizar status), o cache da lista de tarefas será invalidado imediatamente (`queryClient.invalidateQueries(['tasks'])`) para refletir a mudança.

### 4.2. Principais Componentes
- **`TaskDashboard`**: Container principal que gerencia o estado da lista e filtros via `useQuery`.
- **`TaskList`**: Lista de cards de tarefas.
- **`TaskCard`**: Exibição resumida (Título, Status, Responsável, Prazo).
- **`TaskFilters`**: Barra superior para busca e filtros rápidos por status.
- **`TaskForm`**: Modal/Página para criação e edição de tarefas (utiliza `useMutation`).
- **`TaskDetailsView`**: Visualização detalhada com a aba de "Histórico".
- **`AuditTimeline`**: Componente visual que renderiza o `task_history` como uma linha do tempo.

## 5. Security

1.  **Autenticação:** Obrigatória para todos os endpoints via Header `Authorization: Bearer <JWT>`.
2.  **Autorização (RBAC):**
    -   **Diretor:** Pode criar, editar qualquer tarefa e visualizar todo o histórico.
    -   **Funcionário:** Pode visualizar suas tarefas atribuídas e atualizar o `status` para `IN_PROGRESS` ou `COMPLETED`.
3.  **Validação:** Sanitização de inputs no backend para evitar XSS e SQL Injection (provido nativamente pelo SQLAlchemy/SQLModel).

## 6. Requirements Mapping

| Requisito (Spec) | Componente/Solução |
| :--- | :--- |
| Criar e editar tarefas | `POST /tasks`, `PATCH /tasks`, `TaskForm` |
| Atribuição a responsáveis | Campo `assigned_to_id` na tabela `tasks` |
| Mudança de status | Endpoint `PATCH` com validação de transição de status |
| Histórico de alterações | Tabela `task_history` e componente `AuditTimeline` |
| Filtros básicos | Query params no `GET /tasks` e `TaskFilters` no UI |

## 7. Trade-off Analysis

### Decisão: Tabela de Histórico Dedicada vs. Campo JSONB na Task
- **Opção A (JSONB):** Armazenar o histórico como um array JSON dentro da tabela `tasks`. Mais simples de consultar junto com a tarefa.
- **Opção B (Tabela Dedicada):** Criar `task_history`. Melhor para auditoria em larga escala, relatórios de performance de funcionários e mantém a tabela principal leve.
- **Escolha:** **Opção B**. Justificativa: O critério de sucesso exige "histórico confiável para auditoria". Uma tabela dedicada facilita queries complexas no futuro (ex: tempo médio por status).

### Decisão: Lógica de Histórico no App vs. Database Triggers
- **Opção A (Database Triggers):** Garantia absoluta de log mesmo se alterado via SQL manual.
- **Opção B (App Logic):** Mais fácil de testar, manter e incluir o `changed_by_id` vindo do contexto do JWT sem hacks no DB.
- **Escolha:** **Opção B (App Logic/Service Layer)**. Justificativa: Mantém a lógica de negócio centralizada no código Python e facilita a identificação do usuário logado.

## 8. Testing Strategy

### 8.1. Backend (Pytest)
- **Unit Tests:** Validação dos Schemas Pydantic e lógica de transição de status.
- **Integration Tests:** Testar o ciclo de vida completo (Criar -> Listar -> Atualizar -> Verificar Histórico) usando um banco de dados in-memory (SQLite) ou container temporário.
- **Mocks:** Mockar o serviço de autenticação para testar permissões RBAC.

### 8.2. Frontend (Vitest + React Testing Library)
- **Component Tests:** Garantir que `TaskCard` exibe as cores corretas por status.
- **Form Validation:** Testar se o `TaskForm` impede submissão sem título.

### 8.3. E2E (Playwright)
- Fluxo crítico: Diretor cria tarefa -> Funcionário altera para concluído -> Diretor valida no histórico.

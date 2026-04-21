# Plano de Implementação: Task 2.1 - Task Dashboard & List Components

## Objetivo
Criar a base visual do módulo de gestão de tarefas no Frontend (React), permitindo que Diretores e Funcionários visualizem as tarefas cadastradas de acordo com as regras de negócio (RBAC) e filtrem por status.

## Key Files & Context
- **`frontend/src/features/task-management/`**: Nova estrutura de pastas baseada em features.
- **`TaskDashboard.tsx`**: Componente contêiner principal.
- **`TaskList.tsx`**: Componente para renderizar a lista de tarefas.
- **`TaskCard.tsx`**: Componente visual para cada tarefa individual.
- **`TaskFilters.tsx`**: Componente para controles de busca e filtro.
- **`api.ts`**: Configuração do cliente HTTP (Axios/Fetch) para comunicação com o backend FastAPI.

## Estratégia (Implementation Steps)

### 1. Configuração Base (API e Tipos)
- Criar `frontend/src/features/task-management/types/index.ts` espelhando os Schemas do Backend (`TaskRead`, `TaskStatus`, `TaskPriority`).
- Configurar uma instância base do `fetch` ou `axios` em `frontend/src/api/client.ts` que intercepte e adicione o JWT armazenado (simulado ou real) no header `Authorization`.

### 2. Desenvolvimento dos Componentes de UI (KISS e Mobile-First)
- **`TaskCard`**: Renderizar Título, Status (com cores visuais usando CSS Vanilla), Prioridade e Responsável.
- **`TaskList`**: Receber um array de tarefas via props e mapear em vários `TaskCard`s. Implementar estado vazio ("Nenhuma tarefa encontrada").
- **`TaskFilters`**: Criar um dropdown/select simples para `Status` e um botão de "Limpar Filtros".
- **`TaskDashboard`**: Orquestrar o estado (State) de `filters` e os dados `tasks`.

### 3. Integração e Sincronização (State Management)
- Instalar e configurar o **React Query (@tanstack/react-query)** para gerenciar o estado assíncrono (loading, error, data).
- Criar o hook `useTasks(filters)` que chama o endpoint `GET /api/v1/tasks/` passando os query params (`status`, `priority`, etc).
- Ligar o `useTasks` ao `TaskDashboard` para injetar os dados no `TaskList`.

## Verificação e Testes
- **Visual:** Confirmar que a tela renderiza corretamente no formato responsivo.
- **Integração:** Confirmar que a troca do filtro no `TaskFilters` dispara uma nova requisição na aba Network e atualiza a lista de tarefas.
- **Autorização:** Validar que ao rodar o app usando um JWT de "Funcionário", apenas as tarefas dele são listadas (o Backend já faz isso, o Front só precisa não quebrar).

## Considerações
- O design usará **CSS Modules** para evitar conflitos de escopo.
- Não focaremos na criação/edição agora (isso é a Task 2.2). O foco é exclusivamento **Listagem** e **Filtro**.

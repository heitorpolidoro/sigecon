# Technical Backlog & Expert Reviews - CONCLUÍDO

Este documento consolida as sugestões de melhoria contínua, dívidas técnicas e ajustes de integração identificados pelo time de especialistas durante a implementação do Backend (Task 1.*).

## 1. Arquitetura & SQL (Software Architect / SQL Expert)
- [ ] **Full-Text Search:** Avaliar a criação de um índice de busca textual avançada (ex: `GIN` no PostgreSQL) para o campo `title` e `description` na tabela `Task`, caso o volume de dados cresça significativamente. (Avaliado: Prematuro para o volume atual).
- [x] **Soft Delete:** Implementar "soft delete" (adicionar coluna `is_deleted` booleana) para tarefas, em vez de exclusão física, mantendo o histórico de auditoria intacto mesmo após a remoção aparente.

## 2. Backend & Python (Python Expert / Staff Engineer)
- [x] **Tratamento Global de Erros:** Mover as validações de `if not task: raise HTTPException(404)` espalhadas pelos endpoints para Exception Handlers globais do FastAPI, criando exceções de domínio customizadas (ex: `TaskNotFoundError`).
- [x] **Desacoplamento de Validação:** Mover a lógica de restrição de campos do RBAC (ex: "Funcionário só atualiza status") do endpoint `PATCH` para a camada de Serviço ou para validadores avançados do Pydantic.
- [x] **Otimização de Consultas (Double Fetching):** O endpoint `PATCH` faz um `session.get(Task)` para validar RBAC e depois o `TaskService.update_task` faz outro `session.get(Task)`. Refatorar para passar a instância da tarefa já carregada para o serviço.

## 3. Integração Frontend (React Expert)
- [x] **Enriquecimento de Histórico (UX):** O endpoint `GET /tasks/{id}/history` retorna apenas o `changed_by_id`. Para evitar que o Frontend faça chamadas extras (N+1 query problem) para descobrir o nome de quem alterou, o backend deve fazer um `JOIN` com a tabela `User` e retornar o `user_name` ou `full_name` no schema `TaskHistoryRead`.
- [x] **Filtros Expandidos:** O endpoint `GET /tasks/` atualmente só filtra por `status`. Para suportar o Dashboard planejado, adicionar filtros opcionais por `priority` e `assigned_to_id`.
- [x] **Autenticação Form-Data:** O Frontend precisa ser instruído a usar `URLSearchParams` ao chamar o `/api/v1/auth/login`, pois o FastAPI (`OAuth2PasswordRequestForm`) espera `application/x-www-form-urlencoded` e não JSON.

## 4. Qualidade & Testes (QA)
- [x] **Expansão da Suíte de Testes:** Adicionar testes automatizados para os filtros da listagem de tarefas (verificar se o filtro por status retorna apenas as tarefas corretas).
- [x] **Testes de Integração:** Criar um teste E2E ponta-a-ponta validando o fluxo: "Login -> Criar Tarefa -> Listar Tarefa -> Atualizar Tarefa -> Ler Histórico".
- [ ] **Resolução de Warnings de Recursos:** Investigar e corrigir os avisos de `ResourceWarning: unclosed database` durante a execução dos testes, garantindo o fechamento correto das conexões e engines do banco de dados em cada fixture.
- [ ] **Restauração de Cobertura Frontend:** Incrementar os testes unitários e de integração para as novas páginas de Administração de Usuários, visando restaurar o threshold de 100% de cobertura global no frontend.

## 5. Segurança & DevSecOps
- [x] **Validação de Senhas:** Implementar regras de complexidade de senha no registro de usuários (ex: mínimo de 8 caracteres, letras, números e símbolos) via validadores do Pydantic.
- [x] **Rate Limiting:** Adicionar um middleware de limitação de taxa (Rate Limiting) no endpoint de `/login` para prevenir ataques de força bruta.
- [x] **Rotação de Chaves:** Implementar um mecanismo de rotação para a `SECRET_KEY` do JWT em produção.

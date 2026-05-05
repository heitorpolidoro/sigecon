# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIGECON is a task management web app (Portuguese). It supports task creation, assignment, status tracking, and audit logging with role-based access control (RBAC). Two roles: `ADMINISTRADOR` (full access) and `DIRETOR` (limited, sees only own tasks and can only change status).

## Commands

### Backend (run from `backend/`)

```bash
uv sync --all-groups          # Install dependencies
uv run pytest                 # Run all tests (enforces ≥90% coverage)
uv run pytest tests/test_auth_logic.py -v   # Run a single test file
uv run pytest tests/test_tasks_api.py::test_create_task -v  # Run a single test
ruff check .                  # Lint
ruff check --fix .            # Auto-fix lint issues
ruff format .                 # Format
uvicorn app.main:app --reload # Run dev server (needs .env with DB credentials)
alembic upgrade head          # Apply migrations
alembic revision --autogenerate -m "description"  # Create a new migration
```

### Frontend (run from `frontend/`)

```bash
npm install                   # Install dependencies
npm run dev                   # Dev server at http://localhost:5173
npm run test                  # Run all tests once
npm run test:coverage         # Run tests with coverage (enforces ≥75%)
npm run test -- src/features/task-management/components/__tests__/TaskCard.test.tsx  # Single test file
npm run lint                  # ESLint check
npm run build                 # TypeScript + Vite production build
```

### Full Stack

```bash
docker-compose up --build     # Start all services (db on 5435, backend on 8000, frontend on 5175)
docker-compose up --build backend  # Backend + DB only
```

### Pre-commit Hook

A pre-commit hook runs both `uv run pytest` (backend) and `npm run test:coverage` (frontend) before every commit. Commits are blocked if either fails. The pytest.ini enforces `--cov-fail-under=90`; the Vitest config enforces 75% lines/functions/statements and 70% branches.

## Architecture

### Stack

- **Backend:** Python 3.13, FastAPI, SQLModel (SQLAlchemy + Pydantic), PostgreSQL 16, Alembic, JWT auth (`python-jose`), `bcrypt`, `slowapi` rate limiting, `uv` package manager
- **Frontend:** React 19, TypeScript, Vite, React Router 7, TanStack Query 5, Axios, CSS Modules, Vitest + Testing Library
- **Infra:** Docker Compose for local orchestration, GitHub Actions CI, SonarCloud + DeepSource for code quality

### Request Flow

1. Frontend sends requests to `http://localhost:8000/api/v1` (configured via `VITE_API_URL`).
2. The Axios client in `frontend/src/api/client.ts` attaches `Authorization: Bearer <token>` from `localStorage` (`accessToken`) on every request.
3. FastAPI routes use `get_current_user()` from `backend/app/api/deps.py` to validate the JWT and inject the user.
4. Admin-only endpoints additionally call `get_current_active_admin()`, which enforces the `ADMINISTRADOR` role.

### Authentication Flow

- `POST /api/v1/auth/signup` creates an inactive `DIRETOR` account. An admin must activate it.
- `POST /api/v1/auth/login` returns a JWT (HS256, 30-minute expiry). Rate-limited to 5/minute.
- Tokens are stored in `localStorage` and managed by `AuthContext` in `frontend/src/features/user-administration/context/`.

### Backend Structure

```
backend/app/
├── core/           # config (Pydantic Settings), security (JWT/bcrypt), rate limiter, exception handlers
├── models/         # SQLModel table classes: User, Task, TaskHistory, enums (UserRole, TaskStatus, TaskPriority)
├── schemas/        # Pydantic request/response schemas (separate from models)
├── api/
│   ├── deps.py     # FastAPI dependencies: get_session, get_current_user, get_current_active_admin
│   └── v1/endpoints/  # auth.py, tasks.py, users.py
├── services/
│   └── task_service.py  # All task business logic (create, update with audit, soft-delete, RBAC filtering)
└── db.py           # Engine creation + get_session
```

All task mutations go through `task_service.py`, which also writes to `TaskHistory` for audit. Soft-delete is used: tasks have an `is_deleted` flag and are never physically removed.

### Frontend Structure

```
frontend/src/
├── api/client.ts        # Axios instance with JWT interceptor
├── features/
│   ├── task-management/ # TaskDashboard, TaskCard, hooks (useTask*), types
│   └── user-administration/  # LoginPage, SignupPage, AdminUserDashboard, AuthContext, ProtectedRoute
└── App.tsx              # Route definitions, ProtectedRoute wiring
```

`ProtectedRoute` enforces both authentication and optional role requirements at the route level.

### Database

Three tables: `user`, `task`, `taskhistory`. Tasks have FK to `user` twice (creator and assignee). `TaskHistory` records field-level changes (field name, old value, new value, timestamp, changed-by user). Migrations live in `backend/alembic/versions/`.

Test fixtures in `backend/tests/conftest.py` use an in-memory SQLite DB (not PostgreSQL) — be aware of any PostgreSQL-specific behavior that may differ.

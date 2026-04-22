# Implementation Plan: DeepSource and SonarCloud Monorepo Configuration

## Objective
Configure DeepSource and SonarCloud to correctly analyze the `sigecon` monorepo, separating the analysis context for the Python backend and the React/TypeScript frontend without splitting the project into multiple repositories.

## Scope & Impact
- **Impact:** Improves static analysis accuracy, reduces false positives, and prevents tools from failing due to mixed language contexts.
- **Scope:** Root configuration files (`.deepsource.toml`, `sonar-project.properties`). No application code will be modified.

## Proposed Solution
1.  **Create `.deepsource.toml`:**
    -   Define the `python` analyzer targeting the `backend/` directory (version 3.11+).
    -   Define the `javascript`/`typescript` analyzer targeting the `frontend/` directory.
    -   Configure global excludes (`node_modules`, `.venv`, `dist`, `alembic/versions`, etc.).
2.  **Update `sonar-project.properties`:**
    -   Refine `sonar.inclusions` and `sonar.exclusions` to clearly demarcate the backend and frontend sources.
    -   Ensure test files and build artifacts are properly excluded from the main analysis to prevent skewed metrics.

## Implementation Steps
1.  Create a new branch: `chore/deepsource-monorepo-config`.
2.  Create `.deepsource.toml` in the project root with the appropriate analyzers and test coverage settings.
3.  Update the existing `sonar-project.properties` in the project root to refine exclusions.
4.  Commit the changes with a clear message explaining the monorepo setup.
5.  Create a Pull Request against the `master` branch.

## Verification
-   Verify the syntax of `.deepsource.toml`.
-   Verify the PR is created successfully.

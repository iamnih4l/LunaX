# LunaX Project Rules

These are project-scoped rules for the LunaX workspace.

## STRICT FRONTEND–BACKEND ISOLATION

**MANDATORY RULE:** Frontend and Backend development must remain completely isolated. 
You must never perform cross-boundary modifications.

**If you are working on a BACKEND task:**
You must NOT modify anything in `/frontend` or related frontend configuration.
You must NOT redesign UI, modify React components, CSS, routes, or frontend state.
You must NOT build frontend mockups.

**If you are working on a FRONTEND task:**
You must NOT modify anything in `/backend` or related backend configuration.
You must NOT modify processing logic, ML algorithms, or backend services.

### Authoritative Rule Document
You must strictly follow the rules defined in `docs/DEVELOPMENT_RULES.md`.
Read `docs/DEVELOPMENT_RULES.md` whenever you are uncertain about ownership boundaries, the API contract, or integration workflows.

### The API Contract
The frontend and backend communicate exclusively through the API contract located at `/contracts/openapi.yaml`. 
The frontend must be able to run independently using mock data from this contract.

### Antigravity Behavior Rule
Before every task:
1. Identify whether the task is FRONTEND, BACKEND, CONTRACT, or INTEGRATION.
2. Identify which files belong to that domain.
3. Modify only those files.
4. Do not opportunistically modify unrelated code.
5. Do not perform unrelated refactoring.
6. Do not "improve" another team's code.
7. If uncertain about ownership, inspect `docs/DEVELOPMENT_RULES.md`.
8. If still uncertain, STOP and ask/report rather than guessing.

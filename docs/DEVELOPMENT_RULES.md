# LunaX Frontend–Backend Development Rules

This document is the authoritative source for development boundaries in the LunaX project. 
It defines strict rules to ensure parallel development by isolating the frontend and backend teams. Code conflict and ownership boundary violations are unacceptable.

## 1. Core Rule — Frontend and Backend Must Be Isolated

**NEVER modify frontend code while implementing backend functionality.**
**NEVER modify backend code while implementing frontend functionality unless explicitly requested.**

### If working on backend:
**DO NOT:**
- Redesign UI
- Modify UI components (React, Vue, etc.)
- Modify CSS
- Modify frontend routes
- Modify frontend state
- Modify frontend animations
- Modify frontend visualizations
- Modify frontend dependencies
- Replace frontend mock data
- Restructure frontend folders
- Change frontend components to "make integration easier"

### If working on frontend:
**DO NOT:**
- Modify backend processing logic
- Modify ML algorithms
- Modify image registration algorithms
- Modify PDS4 processing
- Modify DEM processing
- Modify backend services
- Modify backend dependencies
- Restructure backend modules
- Change API implementation merely to satisfy frontend convenience

*Only make cross-boundary changes when explicitly requested via a Change Request.*

## 2. Ownership Boundaries

The project structure enforces strict ownership:

### FRONTEND OWNERSHIP
The frontend team (responsible for the cinematic, interactive lunar-science interface) owns:
- `/frontend`
- `/frontend/src/components`
- `/frontend/src/pages`
- `/frontend/src/views`
- `/frontend/src/hooks`
- `/frontend/src/styles`
- `/frontend/src/assets`
- Frontend-specific configurations (e.g., `package.json`, `vite.config.ts`, `tailwind.config.js`)

### BACKEND OWNERSHIP
The backend/ML team (responsible for image processing, PDS4 ingestion, matching pipeline) owns:
- `/backend`
- `/backend/src/api`
- `/backend/src/services`
- `/backend/src/ml`
- `/backend/src/pipeline`
- `/backend/src/processing`
- Backend-specific configurations (e.g., `requirements.txt`, `pyproject.toml`)

### SHARED OWNERSHIP
Only clearly defined integration resources may be shared.
- `/contracts` (API definitions)
- `/docs` (Project documentation)
- `/types` or `/schemas` (Shared data structures, if applicable)

## 3. The API Contract Is The Boundary

The frontend and backend must communicate exclusively through a clearly defined API contract.
- The frontend should NOT depend on backend implementation details.
- The backend should NOT depend on frontend implementation details.

The contract must define:
- Endpoints and HTTP methods
- Request and Response structures
- Parameter names and data types
- Error responses
- Processing status
- File references and metadata structures
- Registration results and evaluation metrics

**Contract Location:** 
`/contracts/openapi.yaml` (Authoritative OpenAPI specification)

## 4. Contract-First Development

The workflow rule is strictly:
**BACKEND IMPLEMENTATION → API CONTRACT → FRONTEND INTEGRATION**

The frontend must only know what the API contract exposes. The backend may internally change ML models, algorithms, libraries, or architecture without requiring frontend changes, as long as the API contract remains compatible.

## 5. Design The Contract Around The Actual SIH Pipeline

The API contract should expose concepts from the research pipeline.
Potential API-level concepts include:
- `Observation`
- `SensorMetadata`
- `AcquisitionGeometry`
- `ImageMetadata`
- `ProcessingJob`
- `ProcessingStage`
- `FeaturePoint`
- `Correspondence`
- `Inlier`
- `RegistrationResult`
- `EvaluationMetrics`
- `RegisteredProduct`

DO NOT expose internal implementation details (e.g., internal Python class structures) unnecessarily.

## 6. Frontend Must Be Able To Work Without The Backend

This is critical for parallel development. The frontend must be capable of development and demonstration using **MOCK API RESPONSES** or **LOCAL FIXTURE DATA**.

Create a clean abstraction:
`Frontend → API Client → Mock API / Real API`

Do not scatter hardcoded mock values throughout components. Use a centralized mock-data/service layer (e.g., `/frontend/src/api/mock`).

## 7. Never Hardcode Backend Implementation Details

- **BAD:** The frontend assumes a specific Python response structure because the backend uses LightGlue.
- **GOOD:** The frontend receives a standardized API response:
  ```json
  {
    "stage": "feature_matching",
    "status": "completed",
    "matches": [...]
  }
  ```
The frontend should not care whether the backend uses LightGlue, RIFT2, SuperPoint, OpenCV, PyTorch, etc.

## 8. Processing Pipeline Status API

The frontend visualizes the cinematic processing pipeline. Each stage should have a predictable status representation (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).

Stages include:
- PDS4 INGESTION
- DEM PROJECTION
- PHOTOMETRIC NORMALIZATION
- FEATURE MATCHING
- MATCH REGULARIZATION
- ROBUST FIT
- LOCAL WARP
- SUB-PIXEL REFINEMENT
- PRODUCT GENERATION

## 9. Frontend Should Not Wait For Final Backend

Frontend development must proceed using mock data. The frontend team will build the 3D Moon, sensor footprints, observation selection, correspondence visualization, etc., without requiring the backend to be finished.

## 10. Backend Should Not Build Frontend Mockups

The backend team must NOT create frontend UI merely to demonstrate the backend. The backend provides the API, OpenAPI docs, test data, and sample payloads. Use backend test clients or CLI to demonstrate functionality.

## 11. Shared Types / Schemas

If the project uses TypeScript, API types should be generated from the OpenAPI contract. 
`OpenAPI → Generated TypeScript Types → Frontend API Client`
Do not manually duplicate schemas if they can be generated safely.

## 12. API Versioning

Prefer versioning where appropriate (e.g., `/api/v1/...`). Breaking API changes must be documented:
1. Update the contract.
2. Document the change.
3. Update example payloads.
4. Notify the frontend team.
5. Do NOT silently change response structures.

## 13. NO CROSS-TEAM "CLEANUPS"

**Mandatory Rule:** When working on one side of the system, DO NOT perform unrelated cleanup on the other side.
- Backend tasks must not rename React components or reorganize CSS.
- Frontend tasks must not refactor Python processing or backend schemas.

## 14. Dependency Isolation

Frontend and backend dependencies must remain isolated. Do not add a dependency to the other team's environment merely because it is convenient. Check `package.json` vs `requirements.txt`/`pyproject.toml`.

## 15. File Modification Safety

Before modifying a file:
1. Determine which team owns it.
2. Determine whether the current task requires modifying it.
3. If it belongs to another team, DO NOT modify it unless explicitly instructed.

If a cross-team change is genuinely required, STOP and report: **"CROSS-BOUNDARY CHANGE REQUIRED"**. Do not silently make the change.

## 16. Git / Commit Boundaries

- Frontend commits should contain only frontend changes (e.g., `feat(frontend): add lunar globe interaction`).
- Backend commits should contain only backend changes (e.g., `feat(backend): implement DEM projection`).
- Contract commits should be isolated (e.g., `feat(contract): define registration result schema`).
- Avoid mixed commits.

## 17. Integration Workflow

1. Agree on API contract.
2. Backend creates sample responses.
3. Frontend builds against mock responses.
4. Backend implements actual processing.
5. Frontend connects API client to backend.
6. Run integration tests.
7. Validate scientific outputs.
8. Fix integration issues without violating ownership boundaries.

## 18. Frontend Integration Abstraction

Components should NOT directly perform `fetch` calls. 
`UI Components → Application State → API Service/Repository → HTTP Client → Backend API`
This makes switching between Mock API and Real API seamless.

## 19. Backend Response Requirements

Backend API responses should be predictable, typed, documented, and independent of frontend implementation. The backend returns scientific/domain data; the frontend decides how it is visualized.

## 20. Error Handling

Define consistent API errors. The frontend should receive structured errors rather than parsing arbitrary messages.
```json
{
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "...",
    "stage": "feature_matching"
  }
}
```

## 21. Large Files / Image Data

The frontend must NOT assume massive lunar images will be returned inside JSON. The backend should provide references/endpoints for thumbnails, visualization tiles, and downloadable products.

## 22. Scientific Data Integrity

The backend owns scientific correctness. The frontend must never fabricate or modify scientific values (e.g., RMSE, Sun Angle) merely for visual presentation. Mock data must be explicitly identifiable during development.

## 23. Demo Mode vs Real Mode

The frontend should support two states: **DEMO / MOCK MODE** and **REAL MODE**. The UI should clearly indicate when DEMO DATA or BACKEND NOT CONNECTED is being used.

## 24. Documentation of the Contract

The `/contracts/openapi.yaml` and related docs must detail endpoints, request/response examples, errors, processing stages, and data models so both teams can work independently.

## 25. Cross-Team Change Request Process

If a cross-boundary change is required, document it via a change request containing: TITLE, Reason, Affected team, Affected files, Proposed solution, API contract impact, Priority. Proceed only after explicit approval.

## 26. ANTIGRAVITY BEHAVIOR RULE

Before every task, the AI coding agent must:
1. Identify whether the task is FRONTEND, BACKEND, CONTRACT, or INTEGRATION.
2. Identify which files belong to that domain.
3. Modify only those files.
4. Do not opportunistically modify unrelated code.
5. Do not perform unrelated refactoring.
6. Do not "improve" another team's code.
7. If uncertain about ownership, inspect `DEVELOPMENT_RULES.md`.
8. If still uncertain, STOP and ask/report rather than guessing.

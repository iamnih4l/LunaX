# New Frontend Architecture

## Design Philosophy: Strict Decoupling

The frontend will be rebuilt from scratch with a strictly isolated architecture using a **Service Adapter Pattern**. The UI must never rely directly on the backend's internal data structures. Instead, it will use internal domain models that map to whatever the backend provides.

This satisfies the requirement: *"Create the frontend in such a way that even if the backend changes later on it can still be adjusted so create a frontend where it is standalone from the backend, we will connect from the backend."*

## 1. Directory Structure

```text
/frontend/src/
  /core/                 # Core domain logic (Decoupled from UI)
    /types/              # Frontend-specific TypeScript interfaces
    /api/                # API Abstract Interface
      apiService.ts      # The interface components use (e.g., register(), getStatus())
      realClient.ts      # Maps backend schemas (schemas.py) -> frontend types
      mockClient.ts      # Offline/demo mock implementations
  /ui/                   # UI Presentation Layer
    /components/         # Reusable React components
    /views/              # Full page views (Landing, Explorer, Correspondence)
    /styles/             # Vanilla CSS
  /store/                # React state management (Zustand)
  /assets/               # Images and static assets
```

## 2. Core Abstraction (Service Layer)

Instead of the UI calling `fetch('/api/v1/register')` directly and tightly coupling the component to the backend's `RegistrationRequest` schema, the UI will call `apiService.registerPair(source, reference)`.

If the backend schema changes from `source_dataset_id` to something else entirely, we only update `realClient.ts`. The UI remains 100% untouched.

## 3. Robust State Management

The frontend will explicitly manage every stage of data loading to prevent the "blank screen" bug found in the legacy implementation.

Every async process will have states:
- `IDLE`
- `VALIDATING`
- `LOADING/PROCESSING`
- `SUCCESS`
- `ERROR`
- `EMPTY`

Components must render explicit views for *each* of these states. React Error Boundaries will wrap major sections to prevent entire application crashes if one visual component fails.

## 4. Components

- **LunarGlobe:** Uses `@react-three/fiber` for a 3D immersive moon.
- **CorrespondenceWorkspace:** The central fix of this rebuild. It handles the WebSocket stream cleanly and safely visualizes images side-by-side using `<canvas>` for high-performance coordinate overlaying.
- **MetricsPanel:** Safely displays scientific metrics without assuming their existence.
- **ErrorDisplay:** Standardized component for rendering API failures.

## 5. Technology Stack
- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Vanilla CSS (Cinematic Aesthetic: dark themes, glowing accents)
- **State Management:** Zustand
- **3D Engine:** `@react-three/fiber` and `three.js`
- **Routing:** `react-router-dom` or lightweight state-based view switching.

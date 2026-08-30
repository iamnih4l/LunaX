# Legacy Frontend Concept

## 1. Overall Concept
The legacy frontend was designed to provide a highly cinematic, interactive lunar-science interface. It was intended to feel like a professional mission-control interface, combining interactive 3D visualization (using `@react-three/fiber`) with strict scientific overlays and telemetry data.

## 2. User Journey
1. **Landing:** The user arrives at an immersive landing page.
2. **Exploration (Explorer.tsx):** The user interacts with a 3D Lunar Globe, viewing available observations plotted on the Moon's surface.
3. **Observation Selection:** The user selects two observations (a Source and a Reference image) from different sensors (e.g., OHRC and IIRS).
4. **Workspace/Correspondence (Workspace.tsx):** The user initiates a registration workflow. The pipeline progresses through stages: Ingestion -> Preprocessing -> Feature Extraction -> Geometry -> Registration -> Evaluation.
5. **Image Comparison:** The user views the two images side-by-side with overlaid feature correspondences.
6. **Results & Metrics:** Post-registration, the user reviews evaluation metrics (RMSE, Inlier Ratio) and generates a report.
7. **Report Export:** The final stage allows downloading a summarized PDF/JSON of the registration results.

## 3. Screens
- **Landing:** Hero section with "Start Exploration" action.
- **Explorer:** 3D Moon canvas, left-side selection panel, right-side HUD.
- **Acquisition (WIP):** Detailed view of selected observations.
- **Workspace (The critical broken piece):** Shows the side-by-side comparison, a pipeline progress indicator, and telemetry. This was fundamentally flawed because it deeply coupled demo state with the UI, leading to blank screens when state broke or real data was missing.
- **Result:** Detailed view of the warped source image overlaying the reference image.
- **Report:** Summarized view for export.

## 4. User Interactions
- **3D Interaction:** Orbit controls around the Lunar Globe.
- **Observation Selection:** Clicking cards to select reference/source images.
- **Pipeline Execution:** A primary "BEGIN REGISTRATION" action that triggers the processing pipeline.

## 5. Backend Dependencies
The frontend conceptually depended on endpoints for fetching datasets and initiating a registration job, then streaming updates via WebSocket. However, in reality, much of the frontend relied heavily on a hardcoded mock module (`api/mock.ts`) that bypassed the real backend entirely in many places.

## 6. Data Flow
`User Action -> UI State -> API Client -> WebSocket Subscription -> UI State Update (Progress Bar & Status)`
The critical failure point in the legacy system was in `Workspace.tsx`: it expected perfect state synchrony between React state and the backend job status.

## 7. Visual Concept
- **Colors:** Deep blacks, subtle greys, neon accents for sensors (OHRC = blue/cyan, TMC2 = green, IIRS = red/orange).
- **Typography:** Monospaced and sans-serif fonts giving a "telemetry" feel.
- **Components:** Glassmorphism panels, minimal borders, glowing indicators.

## 8. Known Problems
- **Correspondence Blank Screen:** The `Workspace.tsx` component would often crash or render empty (`workspace--empty`) due to a reliance on missing state or undefined demo data objects. It lacked robust error boundaries.
- **Tight Coupling:** The UI deeply depended on the exact structure of `api/mock.ts` and failed when confronted with real, unpredictable data.
- **Missing Loading/Error States:** Failed WebSocket connections or API timeouts crashed the workflow without user feedback.

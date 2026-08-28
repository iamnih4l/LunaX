# LunaX Frontend Implementation Plan

Based on the feature audit, the following missing or incomplete frontend features will be implemented. All functionality will rely entirely on frontend state and mock API adapters, preserving the strict frontend-backend boundary.

## 1. Interactive 3D Moon & Footprints (B, C)
- **STATUS**: ⚠️ PARTIALLY EXISTS
- **WHAT EXISTS**: Rotatable 3D Lunar Globe with textures.
- **WHAT IS MISSING**: Raycasted lat/lon hover coordinates and 3D footprint overlays.
- **WHAT WILL BE IMPLEMENTED**: Re-apply the pointer raycasting logic to `LunarGlobe.tsx` (fixing the previous overlap issue) and render `LunarFootprints.tsx` over the globe surface.
- **FILES TO MODIFY**: `src/components/LunarGlobe.tsx`, `src/components/LunarFootprints.tsx`.
- **BACKEND DEPENDENCY**: None.
- **MOCK DATA REQUIRED**: Uses existing `footprint` data from `DEMO_OBSERVATIONS`.

## 2. Manual Image Import (E)
- **STATUS**: ❌ MISSING
- **WHAT EXISTS**: None.
- **WHAT IS MISSING**: UI to upload local images, validate format, and preview metadata.
- **WHAT WILL BE IMPLEMENTED**: An `ImageUploader` component within the Explorer panel. It will accept file drops, use `FileReader` for object URLs, extract dimensions, and dispatch a mock `ImageMetadata` object to the Zustand store.
- **FILES TO MODIFY**: `src/views/Explorer.tsx`, `src/components/ImageUploader.tsx` (new).
- **BACKEND DEPENDENCY**: Future POST endpoint for image processing.
- **MOCK DATA REQUIRED**: Synthetic `ImageMetadata` generator for local files.

## 3. Acquisition Geometry Visualization (G)
- **STATUS**: ❌ MISSING
- **WHAT EXISTS**: Base `LunarGlobe`.
- **WHAT IS MISSING**: Specific view demonstrating why correspondence is difficult (viewing angles, Sun vector, scale differences).
- **WHAT WILL BE IMPLEMENTED**: A dedicated `Acquisition.tsx` view bridging Explorer and Workspace. It will point the 3D camera at the selected footprints, render 3D vectors (lines) for the Sun and View directions, and display a telemetry panel highlighting the deltas.
- **FILES TO MODIFY**: `src/App.tsx`, `src/views/Acquisition.tsx` (new), `src/views/Acquisition.css` (new).
- **BACKEND DEPENDENCY**: None.
- **MOCK DATA REQUIRED**: Uses existing `acquisition` data (sun elevation, azimuth).

## 4. Multimodal Correspondence Viewer (J, K, L, M, N)
- **STATUS**: ❌ MISSING
- **WHAT EXISTS**: A static image frame with animated CSS lines.
- **WHAT IS MISSING**: Real visualization of feature points, correspondence lines, bucketing grids, and MAGSAC++ inliers/outliers.
- **WHAT WILL BE IMPLEMENTED**: A powerful HTML5 Canvas-based `CorrespondenceViewer.tsx`. As the pipeline in `Workspace.tsx` advances:
  - **Stage: Feature Matching** -> Draw all points and lines.
  - **Stage: Bucketing** -> Overlay a 16x16 grid and highlight cells.
  - **Stage: MAGSAC++** -> Recolor lines (green = inlier, red = outlier).
  - **Stage: TPS / Phase Corr** -> Subtle animated CSS transform/distortion.
- **FILES TO MODIFY**: `src/views/Workspace.tsx`, `src/components/CorrespondenceViewer.tsx` (new), `src/components/CorrespondenceViewer.css` (new).
- **BACKEND DEPENDENCY**: Future WebSocket or polling endpoint yielding `Correspondence[]`.
- **MOCK DATA REQUIRED**: Synthetic dense correspondence generation (already partially in `api/mock.ts`, will be expanded).

## 5. Final Registration Viewer Enhancements (O, P)
- **STATUS**: ⚠️ PARTIALLY EXISTS
- **WHAT EXISTS**: Source/Reference/Overlay tabs and a swipe slider.
- **WHAT IS MISSING**: Blink comparison, zoom/pan controls, difference overlay, residual vectors.
- **WHAT WILL BE IMPLEMENTED**: Add a "Blink" mode (CSS animation toggling opacity). Add a "Difference" mode using `mix-blend-mode: difference`. Add a zoom/pan wrapper around the image area.
- **FILES TO MODIFY**: `src/views/Result.tsx`, `src/views/Result.css`.
- **BACKEND DEPENDENCY**: Future endpoint serving the registered GeoTIFF/PNG.
- **MOCK DATA REQUIRED**: Uses the same mock URLs as reference/source for demo purposes.

## 6. Export UI (S)
- **STATUS**: ❌ MISSING
- **WHAT EXISTS**: None.
- **WHAT IS MISSING**: Button to export the report and registered image.
- **WHAT WILL BE IMPLEMENTED**: An "EXPORT DATA" button in `Report.tsx` that triggers a mock download (or simply prints a UI toast "Awaiting Backend").
- **FILES TO MODIFY**: `src/views/Report.tsx`.
- **BACKEND DEPENDENCY**: Future export API.
- **MOCK DATA REQUIRED**: None.

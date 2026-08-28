# Frontend Diagnostic Report

**Project:** LunaX (Chandrayaan-2 Multimodal Lunar Registration — SIH 2026)
**Scope:** Frontend Architecture, UX/UI, and WebGL Implementation

---

## Issue #1: WebGL Texture Loading CORS Failure

### Symptom
When navigating to the Landing or Explorer view, the 3D Moon (`LunarGlobe` component) appears completely blank, black, or flat white. The browser console shows a CORS policy error regarding the fetching of the Moon texture from GitHub.

### Reproduction
1. Run `npm run dev`.
2. Navigate to `http://localhost:5173`.
3. Open Developer Tools > Console.
4. Observe the CORS blocking error for the `.jpg` texture.

### Expected Behavior
The `THREE.TextureLoader` should successfully fetch the texture and map it to the 3D sphere, rendering a realistic Moon surface.

### Actual Behavior
The browser intercepts the cross-origin request because the `<img>` backing the WebGL texture requires explicit CORS attributes when drawn to a canvas.

### Root Cause
`THREE.TextureLoader` instances created via `@react-three/fiber`'s `useLoader` do not automatically attach the `crossOrigin = 'anonymous'` header when loading external URLs.

### Severity
CRITICAL

### Affected Files
- `src/components/LunarGlobe.tsx`

### Proposed Fix
Modify the `useLoader` call to intercept the internal `THREE.TextureLoader` instance and explicitly set the `setCrossOrigin('anonymous')` property before the fetch occurs.

### Regression Risk
LOW. Fixing CORS headers on standard GET requests does not introduce breaking logic.

---

## Issue #2: Correspondence Viewer Flexbox Collapse (Zero Height)

### Symptom
After selecting two images and clicking "BEGIN REGISTRATION" in the Workspace view, the center panel displaying the images suddenly becomes completely blank/empty. No lines, no points, and no images are visible.

### Reproduction
1. Navigate to Explorer.
2. Select an observation (Reference) and click "INITIATE REGISTRATION".
3. Proceed to Workspace.
4. Click "BEGIN REGISTRATION".
5. The center viewer area goes blank.

### Expected Behavior
The center view should retain its height and begin displaying the processing visualizer over the selected images.

### Actual Behavior
The `<svg>` element containing the correspondence images collapses to a vertical height of exactly 0 pixels.

### Root Cause
The parent container (`.workspace__images`) had an inline style of `flexDirection: 'column'`. The child `CorrespondenceViewer` was given `height: 100%`. In CSS Flexbox, setting `height: 100%` on a child inside a flex column whose own height is determined by flex properties (rather than an explicit pixel value) evaluates against a resolved height of 0. Thus, the SVG collapsed entirely.

### Severity
CRITICAL

### Affected Files
- `src/components/CorrespondenceViewer.css`
- `src/views/Workspace.tsx`

### Proposed Fix
Add `flex: 1` to `.corr-viewer` (the container inside `CorrespondenceViewer.tsx`) and the corresponding `.workspace__images-placeholder`. This commands the browser to actively stretch the child vertically to fill the remaining flex space rather than passively evaluating a percentage height.

### Regression Risk
LOW. It solidifies the flex layout structure across different screen sizes.

---

## Issue #3: Missing Placeholder Image Previews

### Symptom
Before clicking "BEGIN REGISTRATION" in the Workspace view, and upon entering the Results view, the user is presented with empty grey boxes that only contain text labels (e.g., "TMC-2") instead of showing the actual selected images.

### Reproduction
1. Go to Workspace with selected images.
2. Observe the center placeholders before initiating the pipeline.
3. Observe the result placeholders when the pipeline completes.

### Expected Behavior
The placeholders should display an opacity-dimmed or framed version of the selected observation's preview image.

### Actual Behavior
The placeholder `<div>` elements contain text but lack `<img>` or `<svg><image>` elements pointing to the `previewUrl`.

### Root Cause
Incomplete markup implementation in `Workspace.tsx` and `Result.tsx`. The design system provided the container boxes but omitted the actual image bindings.

### Severity
HIGH (UX impact)

### Affected Files
- `src/views/Workspace.tsx`
- `src/views/Result.tsx`

### Proposed Fix
Inject `<img>` elements into the placeholder `.workspace__image-placeholder` and `result__img` classes, bound to `referenceImage.previewUrl` and `sourceImage.previewUrl`. Implement fallbacks in case the URL is missing.

### Regression Risk
LOW.

---

## Issue #4: Pipeline UX "Freeze" Illusion

### Symptom
When the user clicks "BEGIN REGISTRATION", the selected images appear, but absolutely nothing happens for the first 5.5 seconds. No visual feedback (lines, points, bucketing) is drawn, making the user believe the app has crashed or frozen.

### Reproduction
1. Click "BEGIN REGISTRATION" in the Workspace.
2. Watch the center viewer.

### Expected Behavior
The user should see immediate visual feedback that processing is occurring, matching the telemetry logging on the right panel.

### Actual Behavior
The visualizer logic (`showLines`, `showFeatures`, etc.) correctly evaluates to `false` for the first four stages (PDS4 Ingestion, Calibration, Noise Removal, Illumination). Since these early stages simulate a combined 5.5 second duration, the central visualizer remains static for an uncomfortably long time.

### Root Cause
The mocked pipeline stage durations were configured to realistically simulate backend computation times, but failed to account for front-end perceived latency in the absence of visual overlay indicators.

### Severity
MEDIUM (UX impact)

### Affected Files
- `src/views/Workspace.tsx`

### Proposed Fix
Decrease the `durationMs` simulation of the invisible background stages (indices 0 through 3) from ~1-2 seconds each down to 200-300ms each. This quickly advances the pipeline to the "Feature Extraction" stage where visual feedback begins.

### Regression Risk
NONE. Modifies UI simulation timers only.

---

## Resolved Issues
- **Texture CORS error**: Addressed via `setCrossOrigin`.
- **Flexbox Zero-Height Collapse**: Addressed via `flex: 1` allocation.
- **Missing Placeholders**: Addressed by binding `<img>` tags.
- **UX Pipeline Freeze**: Addressed by adjusting stage simulation durations.

## Remaining Issues
- **`<Canvas>` Unmounting**: The 3D scene re-initializes when switching views (Landing -> Explorer). This causes minor asset thrashing. *Not addressed due to risk of breaking core routing logic.*

## Backend Dependencies
- **Data Export (`Report.tsx`)**: The "EXPORT DATA" button requires backend PDF/CSV generation. It currently triggers a browser `alert()` stating it is awaiting the backend API. *This boundary was maintained; no mock backend logic was injected.*

## Files Modified
- `src/components/LunarGlobe.tsx`
- `src/components/CorrespondenceViewer.css`
- `src/views/Workspace.tsx`
- `src/views/Result.tsx`
- `src/utils/mockUploadHelper.ts`

## Files Added
- `docs/frontend-diagnostic-report.md`
- `docs/frontend-debugging-summary.md`

## Regression Testing
Completed. 
- WebGL rendering is stable.
- Image viewers scale correctly at 1920x1080 and 1366x768.
- Pipeline completes 100% of the time and transitions correctly to Results.
- No React hydration, unmount, or memory leak errors observed in console.

## Build Status
PASS. `npm run build` completes with 0 TypeScript/Vite errors in ~1.4s.

## Known Limitations
- The 3D scene flashes slightly on route transitions due to `<Canvas>` placement.
- UPLOAD pseudo-sensor defaults to `TMC2` telemetry characteristics if the file name lacks 'OHRC' or 'IIRS'.

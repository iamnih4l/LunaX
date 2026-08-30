# LunaX — Temporary Frontend Documentation

## Purpose

This document describes the **temporary frontend implementation** for the LunaX project. The temporary frontend enables a complete, interactive demonstration of the Chandrayaan-2 multimodal image registration workflow using **simulated data** — without requiring a running backend.

**Why?** The existing frontend was architecturally sound but blocked by two issues:
1. The registration pipeline depended on a real backend API that does not yet exist
2. Demo metrics were all `null`, making the results experience hollow

Rather than rebuilding from scratch, the existing frontend was **fixed in place** — surgical changes to make every workflow step functional.

## Architecture

```
USER
  ↓
TEMPORARY FRONTEND (React + Vite + Three.js)
  ↓
SERVICE / API ABSTRACTION (src/api/simulatedApi.ts)
  ↓
SIMULATED DATA (src/api/mock.ts)
```

**Later (when backend is ready):**

```
USER
  ↓
FRONTEND (same UI, same components)
  ↓
SERVICE / API ABSTRACTION (swap implementation only)
  ↓
REAL BACKEND API
```

### Key Principle

UI components never call the backend directly. They call service functions in `simulatedApi.ts`. When the real backend is available, only the internals of these functions need to change — the UI stays identical.

## Simulated Data

All simulated data is in `src/api/mock.ts`. Every value is clearly marked as **DEMO DATA**.

| Data | Source | Notes |
|------|--------|-------|
| Sensor specs (OHRC, TMC-2, IIRS) | Chandrayaan-2 documentation | Accurate GSD values |
| Observations (3 demo) | Simulated PDS4 filenames | Realistic metadata |
| Lunar Regions (5 demo) | Named after real features | Simulated coordinates |
| Correspondences (1,284 matches) | Deterministic PRNG (seed=42) | Consistent across sessions |
| Metrics (RMSE, inlier ratio, etc.) | Simulated values | Clearly labeled as demo |

### Deterministic PRNG

The mock data uses a seeded pseudo-random number generator instead of `Math.random()`. This ensures correspondence points and metrics are **identical every time** the application runs — essential for consistent demonstrations.

## Simulated API

`src/api/simulatedApi.ts` provides these functions:

| Function | Purpose | Simulated Latency |
|----------|---------|------------------|
| `getRegions()` | Fetch lunar regions | 200ms |
| `getObservations()` | Fetch available observations | 150ms |
| `getObservation(id)` | Fetch single observation | 100ms |
| `getGeometry(id)` | Fetch acquisition geometry | 100ms |
| `getSensors()` | Fetch sensor specifications | 50ms |
| `runCorrespondence(ref, src, onProgress)` | **Full pipeline simulation** | ~18s total |
| `exportReport(data)` | Generate downloadable report | Instant |

### Pipeline Simulation

`runCorrespondence()` simulates all 11 pipeline stages:

1. PDS4 Ingestion → XML Parser
2. Metadata Extraction → Ephemeris + Sun Params
3. DEM Projection → LRO-LOLA/Kaguya 59m
4. Photometric Normalization → CLAHE + cos(i)
5. Feature Extraction → SuperPoint
6. Feature Matching → LightGlue + RIFT2
7. Match Regularization → Spatial Grid 16×16
8. Robust Geometric Fitting → MAGSAC++
9. Local Deformation → Thin Plate Splines
10. Sub-pixel Refinement → Phase Correlation 32×32
11. Product Generation → GeoTIFF

Each stage includes:
- Stage-specific log messages
- Realistic timing (1-2.5 seconds per stage)
- Progress callbacks for live UI updates
- Correspondence data delivery during matching stages

## User Workflow

```
LANDING ──→ EXPLORE LUNAR DATA
  ↓
EXPLORER ──→ Rotate Moon, toggle layers, adjust Sun illumination
  ↓         ──→ Select Reference Image (OHRC/TMC-2/IIRS)
  ↓         ──→ Select Source Image
  ↓         ──→ INITIATE CORRESPONDENCE
  ↓
ACQUISITION ──→ View geometry: scale delta, illumination delta
  ↓           ──→ 3D Sun/viewing vectors on Moon
  ↓           ──→ PROCEED TO WORKSPACE
  ↓
WORKSPACE ──→ ▶ BEGIN REGISTRATION
  ↓         ──→ Watch 11-stage pipeline with live progress
  ↓         ──→ Correspondence lines animate during matching
  ↓         ──→ VIEW RESULTS
  ↓
RESULT ──→ Compare modes: Source, Reference, Overlay, Difference, Blink
  ↓      ──→ Slider comparison
  ↓      ──→ Toggle Tiepoints / Residuals
  ↓      ──→ Populated metrics sidebar
  ↓      ──→ SCIENTIFIC REPORT
  ↓
REPORT ──→ Complete observation pair details
  ↓      ──→ Correspondence statistics
  ↓      ──→ Pipeline summary
  ↓      ──→ Evaluation metrics
  ↓      ──→ EXPORT DATA → downloads JSON report
```

## Current Limitations

1. **No real backend** — all data is simulated
2. **No real lunar images** — uses Three.js moon texture as placeholder
3. **No real PDS4 ingestion** — filenames are simulated
4. **Export is client-side JSON** — not a real scientific product
5. **Correspondences are deterministic demo points** — not from actual feature matching
6. **Metrics are demo values** — not from actual registration

## Real Backend Integration

When the backend is ready:

1. In `simulatedApi.ts`, replace `runCorrespondence()` internals with:
   - `startRegistration()` → POST to `/api/v1/register`
   - `connectJobWebSocket()` → WebSocket for live progress
   
2. In `simulatedApi.ts`, replace `exportReport()` with:
   - Call to backend export endpoint
   
3. The existing `src/api/client.ts` already has the HTTP/WebSocket client code — it just needs a running backend to connect to.

4. The `isDemoMode` flag in the Zustand store can be set to `false` to hide demo labels.

**No UI changes are needed for backend integration.** Only the service layer implementations change.

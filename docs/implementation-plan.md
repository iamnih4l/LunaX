# Implementation Plan

The development of the LunaX pipeline is broken down into structured phases.

## Phase 1 — Dataset + PDS4 Ingestion
- **Objective:** Successfully parse and load Chandrayaan-2 data.
- **Tasks:** Write XML parsers for PDS4 labels; extract Ephemeris, pointing, Sun azimuth/elevation, and GSD; load raw image cubes into memory.
- **Dependencies:** ISRO PRADAN dataset access.
- **Success Criteria:** Ability to programmatically access pixel data and exact metadata for any given image.

## Phase 2 — Visualization and Preprocessing
- **Objective:** Establish baseline rendering and image handling.
- **Tasks:** Implement basic contrast stretching; set up logging and visualizers (e.g., matplotlib) for intermediate pipeline steps.

## Phase 3 — DEM Projection (Geometry Engine)
- **Objective:** Achieve coarse geometric alignment.
- **Tasks:** Integrate LRO-LOLA/Kaguya DEM data; implement ray-tracing/intersection logic; resample images onto a common 2D map grid.
- **Dependencies:** Access to global lunar DEMs.
- **Success Criteria:** OHRC, TMC, and IIRS images of the same area visually overlay in the same map projection space.

## Phase 4 — Photometric Normalization
- **Objective:** Achieve Sun-angle invariance.
- **Tasks:** Implement CLAHE and Histogram Matching; implement physics-based $\cos(i)$ scaling based on PDS4 Sun incidence angles and DEM surface normals.
- **Success Criteria:** Images taken at dawn and noon exhibit similar contrast and shadow profiles.

## Phase 5 — Feature Matching
- **Objective:** Achieve multi-modal candidate correspondences.
- **Tasks:** Integrate SuperPoint and LightGlue; integrate RIFT2; implement the fallback logic.
- **Success Criteria:** Successful generation of candidate tiepoints between visible and IR images.

## Phase 6 — Match Filtering (Regularization)
- **Objective:** Achieve uniform tiepoint distribution.
- **Tasks:** Implement spatial grid bucketing; enforce match caps and backfilling logic.
- **Success Criteria:** Match density is visually uniform across the entire image footprint, rather than clustered.

## Phase 7 — Robust Registration
- **Objective:** Filter outliers and establish local deformation fields.
- **Tasks:** Integrate MAGSAC++; calculate initial global transforms; implement Thin Plate Splines (TPS) using inliers as control points.
- **Success Criteria:** Non-planar residual distortions caused by craters are successfully warped and aligned.

## Phase 8 — Sub-pixel Refinement
- **Objective:** Push accuracy beyond the integer grid.
- **Tasks:** Implement patch extraction around tiepoints; implement FFT-based phase correlation; calculate (dx, dy) shifts.
- **Success Criteria:** Final offsets are calculated to sub-pixel decimal values.

## Phase 9 — Output Generation
- **Objective:** Produce the final deliverable.
- **Tasks:** Apply final warp interpolation (cubic/bilinear); serialize output to GeoTIFF; embed spatial metadata.
- **Success Criteria:** Generation of a valid GeoTIFF readable by standard GIS software.

## Phase 10 — Evaluation
- **Objective:** Benchmark the pipeline against SIH requirements.
- **Tasks:** Implement RMSE, Inlier Ratio, and Uniformity metric calculators; execute the experiments defined in the [Experiments](experiments.md) plan.
- **Success Criteria:** Documented proof of invariant, sub-pixel registration exceeding baseline performance.

# Experiments

This document outlines the planned experiments to validate the robustness of the LunaX pipeline across different invariant requirements.

## 1. Sensor Pairs (Multi-modal Invariance)
We will run the pipeline across the three most challenging permutations:
- **OHRC ↔ TMC:** Evaluates extreme scale differences (0.25m vs 5m) within the same visible spectral domain.
- **OHRC ↔ IIRS:** Evaluates extreme scale (0.25m vs 80m) combined with extreme spectral modality (Visible vs Hyperspectral IR).
- **TMC ↔ IIRS:** Evaluates moderate scale (5m vs 80m) and severe spectral modality.

## 2. Illumination Variation (Sun Angle Invariance)
We will test images of the same lunar coordinates acquired under drastically different Sun angles (e.g., Incidence angle of 10° (near noon) vs 80° (near dawn)).
- **Goal:** Prove that the Photometric Normalization step correctly simulates a standard viewing geometry, enabling LightGlue to find matches regardless of original shadow casting.

## 3. Scale Variation
We will artificially downsample and upsample the datasets (altering the GSD) to evaluate the breaking points of the scale invariance provided by the DEM projection.

## 4. Ablation Studies
To demonstrate that every component of the architecture contributes meaningfully, we will run the following ablation tests:
- **Without DEM projection:** To prove standard image-space resizing fails for extreme scales.
- **Without Photometric Normalization:** To prove feature matchers fail across varying sun angles without physics-based correction.
- **LightGlue Only:** To identify cases where deep learning fails on IR bands.
- **RIFT2 Only:** To evaluate speed and accuracy trade-offs.
- **LightGlue + RIFT2:** The proposed ensemble.
- **Without Spatial Bucketing:** To prove that standard matching overfits to heavily textured craters.
- **RANSAC vs MAGSAC++:** To prove MAGSAC++ yields higher inlier ratios.
- **Global Transform (Homography) vs TPS:** To prove local warping is necessary for non-planar terrain.
- **Without Phase Correlation:** To quantify the sub-pixel precision gain.

> **[DATA REQUIRED]** 
> Specific Chandrayaan-2 PDS4 data cubes containing overlapping OHRC/TMC/IIRS captures under varying sun angles must be acquired from the ISRO PRADAN archive to conduct these experiments.

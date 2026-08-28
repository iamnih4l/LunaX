# SIH Presentation Guide

This guide outlines the narrative structure for presenting the LunaX solution to the SIH 2026 judges.

### 1. The Problem
"We need to perfectly align images of the Moon taken by three completely different cameras, at different resolutions, under different lighting, over rugged terrain."

### 2. Why It Is Hard
Highlight the 3 strongest technical challenges:
1. **The Scale Gap:** OHRC is 0.25m/pixel. IIRS is 80m/pixel. That’s a 320x difference. Standard resizing destroys the data.
2. **The Terrain:** The Moon has craters and mountains. A flat mathematical transform (homography) cannot map the complex 3D parallax.
3. **The Modality:** IR sensors see heat and broad minerals; visible sensors see shadows and dust. Standard feature matchers (like SIFT) fail entirely when colors and gradients invert.

### 3. Our Solution
"LunaX doesn't just match pixels; it models the physical environment."
Walk through the architecture:
- We read the PDS4 telemetry to figure out exactly where the camera and the Sun were.
- We ray-trace the image onto a 3D elevation model to flatten the terrain and normalize the scale.
- We use the Sun's angle to physically remove shadows and normalize illumination.
- Finally, we use an AI ensemble (LightGlue + RIFT2) to match features across modalities, and warp the remaining terrain errors using Thin Plate Splines.

### 4. What is Novel
- **Physics-Informed Preprocessing:** We don't rely purely on computer vision. We use astrophysics (ephemeris, DEMs, solar incidence) to solve geometric and illumination invariance *before* matching.
- **Hybrid AI Matching:** Combining the speed of LightGlue with the NRD-insensitivity of RIFT2 for edge-cases.
- **Spatial Bucketing:** Ensuring the mathematical fit is robust across the whole image, not just overfitted to one highly textured crater.

### 5. Why Our Approach Works
The progression is logical and sequential:
**Geometry (DEM) → Photometry (Cos(i)) → Matching (LightGlue/RIFT2) → Robustness (MAGSAC++) → Local correction (TPS) → Sub-pixel precision (Phase Correlation)**. 
Every stage solves one specific invariance requirement.

### 6. Expected Impact
These registered products enable fused lunar science. Scientists can now overlay the ultra-high resolution texture of OHRC directly on top of the mineralogical hyperspectral data of IIRS, creating composite datasets impossible with a single sensor.

### 7. Demo Flow
(Refer to the [Demo Plan](demo-plan.md) for the step-by-step walkthrough).

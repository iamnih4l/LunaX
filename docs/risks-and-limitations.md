# Risks and Limitations

This document identifies potential technical risks to the LunaX pipeline and proposed mitigations.

### 1. Inaccurate PDS4 Geometry
- **Risk:** If the PDS4 Ephemeris or pointing metadata is significantly corrupted or inaccurate, the initial DEM projection will project the image to the entirely wrong coordinates.
- **Impact:** Fatal. The pipeline will fail to find any overlapping features.
- **Mitigation:** Implement a pre-check validation of the metadata. If pointing is extremely off, fallback to a coarse manual or global sift-based tiepoint initialization before DEM projection.
- **Validation:** Compare extracted footprint coordinates against known catalog bounds.

### 2. DEM Resolution Limitations
- **Risk:** The LRO-LOLA global DEM is ~59m/pixel. OHRC is 0.25m/pixel. The DEM lacks the resolution to model small boulders visible in OHRC.
- **Impact:** Moderate. Small-scale parallax will remain after orthorectification.
- **Mitigation:** This is precisely why Thin Plate Splines (TPS) are used later in the pipeline—to absorb and warp these un-modeled high-resolution residuals.
- **Validation:** Measure sub-pixel RMSE on OHRC features.

### 3. Missing/Poor Metadata
- **Risk:** Some IIRS Level-1 cubes are known to have rough or missing map-projection metadata.
- **Impact:** High. Geometric and Photometric correction depend on Sun angles and sensor position.
- **Mitigation:** Fallback to interpolation of metadata from adjacent timestamps or orbit tracks.

### 4. Extreme Illumination Differences
- **Risk:** Images taken in complete darkness (shadowed craters) versus fully lit conditions.
- **Impact:** High. Physics-based correction cannot recover texture that is completely lost to shadow.
- **Mitigation:** If LightGlue fails completely, RIFT2 may salvage some phase-congruency structural edges, but shadowed regions inherently lack data.

### 5. Multimodal Appearance Differences
- **Risk:** IIRS (Hyperspectral) and OHRC (Visible) may look so fundamentally different that no visual features correlate.
- **Impact:** High.
- **Mitigation:** Rely heavily on RIFT2 phase congruency. Focus matching on macro-structures (crater rims) rather than micro-textures.

### 6. TPS Overfitting
- **Risk:** If tiepoints are clustered in one area, TPS will severely distort and warp the un-matched areas of the image.
- **Impact:** High. The resulting map will look "melted" in areas without tiepoints.
- **Mitigation:** Strict enforcement of Spatial Bucketing (Module 5) to guarantee tiepoints exist across the entire grid.

### 7. Computational Cost
- **Risk:** Deep learning models (SuperPoint/LightGlue) and large image arrays (GeoTIFFs can be GBs) exceed available RAM/VRAM.
- **Impact:** Pipeline crashes.
- **Mitigation:** Process images in tiled chunks. LightGlue is specifically chosen because it is less computationally intensive than SuperGlue.

### 8. Sub-pixel Refinement Failure
- **Risk:** Phase correlation fails due to excessive rotation or perspective differences remaining in the patches.
- **Impact:** Low. The system falls back to integer pixel accuracy from the TPS warp.
- **Mitigation:** Ensure patches extracted are small enough (32x32) that rotation within the patch is negligible.

> **[TO VERIFY]** The exact computational complexity (time and memory) of processing a full-strip IIRS + OHRC pair is currently unknown and must be benchmarked during Phase 2.

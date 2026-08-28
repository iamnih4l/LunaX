# Frequently Asked Questions (FAQ)

This document anticipates technical questions from SIH 2026 judges and provides evidence-backed answers based on the LunaX research architecture.

### Q: Why can't we just use SIFT?
**A:** SIFT (and SURF/ORB) rely on local intensity gradients. When comparing a visible band to an infrared (hyperspectral) band, the intensity gradients often behave non-linearly or invert entirely (e.g., what is dark in visible might be bright in IR). SIFT fails to find reliable matches across these modalities. SIFT is also highly sensitive to non-linear illumination changes caused by varying Sun angles.

### Q: Why LightGlue?
**A:** LightGlue is a state-of-the-art deep learning matcher that learns correspondences. It is highly adaptive, meaning it computes faster on "easy" image pairs and uses less memory than its predecessor (SuperGlue). This efficiency is critical when handling massive multi-sensor images like the 0.25m OHRC data.

### Q: Why RIFT2?
**A:** While LightGlue is excellent, extreme multimodal pairs (like OHRC vs IIRS) can sometimes fail deep learning models trained on visible datasets. RIFT2 relies on phase congruency rather than image intensity, making it insensitive to Non-linear Radiometric Distortions (NRD). It serves as an incredibly robust fallback when LightGlue yields low confidence.

### Q: Why use both LightGlue and RIFT2?
**A:** LightGlue is faster and works well for the majority of pairs (like OHRC ↔ TMC). RIFT2 is mathematically robust for the extreme edge cases (OHRC ↔ IIRS). Cascading them provides both speed and guaranteed robustness.

### Q: Why do we need a DEM?
**A:** The scale differences are extreme (0.25m vs 80m). Furthermore, the Moon has massive relief (craters). Without a DEM, we cannot correct for perspective parallax. Projecting to a DEM physically flattens the images to the same 2D map scale before we even begin matching pixels.

### Q: Why is a single homography insufficient?
**A:** A homography assumes the scene being photographed is a perfectly flat 2D plane. The lunar surface is highly non-planar. A homography might align one crater perfectly, but the parallax of a nearby mountain will cause it to be misaligned.

### Q: Why Thin Plate Splines (TPS)?
**A:** TPS provides a non-rigid, local deformation field. It uses our matched tiepoints as control points and smoothly bends the image locally to correct for the non-planar terrain residuals that a global homography misses.

### Q: Why MAGSAC++ instead of RANSAC?
**A:** RANSAC requires a hard distance threshold to decide if a match is good or bad. If you guess the threshold wrong, it fails. MAGSAC++ marginalizes over a range of thresholds, eliminating the need to guess. It is demonstrably faster and yields more accurate inliers on real-world datasets.

### Q: Why phase correlation?
**A:** Phase correlation uses the Fourier transform to find the exact translative shift between two patches of pixels. Because it operates in the frequency domain, we can interpolate the peak of the correlation matrix to find shifts at a *fraction* of a pixel (sub-pixel accuracy), which is required for high-precision science.

### Q: How do you handle different Sun angles?
**A:** We use the PDS4 telemetry to find exactly where the Sun was. We use the DEM to calculate the angle of the terrain. We then calculate the Incidence Angle ($i$) and scale the brightness of the pixels by $\cos(i)$ (or a similar photometric function) to simulate a standard noon-time illumination.

### Q: How do you guarantee spatially uniform tiepoints?
**A:** Through "Spatial Bucketing". We divide the image into a grid. We cap the maximum number of matches allowed in dense cells (like a heavily textured crater) and force the algorithm to sample from sparser cells, ensuring an even distribution across the entire image.

### Q: How do you evaluate accuracy?
**A:** We use Tiepoint RMSE (Root Mean Square Error in meters on the DEM), Inlier Ratio (percentage of good matches), and a Spatial Uniformity Score (variance of match counts across grid cells).

### Q: What happens when matching fails?
**A:** The pipeline cascades from LightGlue to RIFT2. If both fail (e.g., due to a completely shadowed image or corrupt telemetry), the system flags the pair as unregistrable rather than outputting a hallucinated warp. 

> **[TO VERIFY]** The exact threshold for "unregistrable" will be determined during empirical testing in Phase 5.

### Q: Can the system work with all three sensors?
**A:** Yes, the pipeline is sensor-agnostic once the images are projected to the DEM. It can register OHRC to TMC, OHRC to IIRS, or TMC to IIRS.

### Q: What is the computational complexity?
**A:** > **[TO VERIFY]** Formal benchmarking will occur during the evaluation phase. However, LightGlue and RIFT2 are specifically chosen over SuperGlue and RIFT1 for their optimized speed and memory profiles.

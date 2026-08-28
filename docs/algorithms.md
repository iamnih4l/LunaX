# Algorithms

This document outlines the major algorithms and processing techniques employed in the LunaX pipeline.

## DEM-based Orthorectification
**1. What it does:** Projects 2D pixels from a camera onto a 3D Digital Elevation Model (DEM) and resamples them onto a common map grid.
**2. Why we use it:** To eliminate scale and perspective differences caused by camera altitude, view angle, and varying topography.
**3. Where it appears in the pipeline:** Early preprocessing (Module 2).
**4. Input:** PDS4 Image, Sensor Geometry parameters, Lunar DEM.
**5. Output:** Resampled, map-projected, orthorectified image array.
**6. Strengths:** Directly solves extreme scale discrepancies (0.25m vs 80m); implicitly accounts for crater relief and parallax.
**7. Limitations:** Dependent on the accuracy and resolution of the available DEM.
**8. Failure cases:** If the DEM is inaccurate or missing, extreme distortions will be introduced.

## CLAHE (Contrast-Limited Adaptive Histogram Equalization)
**1. What it does:** Locally equalizes image contrast while preventing the over-amplification of noise.
**2. Why we use it:** To enhance local texture details, especially in shadow-heavy or uniformly bright areas.
**3. Where it appears in the pipeline:** Photometric Normalization (Module 3).
**4. Input:** Orthorectified Image.
**5. Output:** Contrast-enhanced Image.
**6. Strengths:** Improves visibility of local features for keypoint extraction.
**7. Limitations:** Does not account for the physical direction of light; can sometimes enhance artifacts.

## Histogram Matching
**1. What it does:** Modifies the histogram of the source image to match the target image.
**2. Why we use it:** To align the global tonal and radiometric distribution between multimodal pairs.
**3. Where it appears in the pipeline:** Photometric Normalization (Module 3).
**4. Input:** Source image, Reference (Target) image.
**5. Output:** Tonally aligned source image.
**6. Strengths:** Simple, fast, and globally effective.
**7. Limitations:** Global method; fails to handle localized lighting differences (e.g., shadows).

## Photometric Correction (Physics-based)
**1. What it does:** Adjusts pixel brightness using known Sun incidence ($i$) and emission angles to simulate a standard viewing geometry (e.g., scaling by $\cos(i)$).
**2. Why we use it:** To achieve true "Sun angle invariance" by reversing physical illumination effects based on the solar position.
**3. Where it appears in the pipeline:** Photometric Normalization (Module 3).
**4. Input:** Image, DEM, Sun azimuth/elevation from PDS4.
**5. Output:** Reflectance-aligned Image.
**6. Strengths:** Physically grounded; removes stark differences between dawn/noon images.
**7. Limitations:** Assumes a Lambertian or specific lunar photometric phase function which may not hold perfectly for all minerals.

## SuperPoint
**1. What it does:** A deep learning model for extracting keypoints and their descriptors.
**2. Why we use it:** Highly robust, repeatable feature extraction even in lower-contrast scenes compared to classic SIFT/ORB.
**3. Where it appears in the pipeline:** Feature Matching (Module 4).
**4. Input:** Normalized Image.
**5. Output:** Keypoint coordinates and descriptors.

## LightGlue
**1. What it does:** A deep learning feature matcher that learns correspondences between SuperPoint features adaptively.
**2. Why we use it:** Faster and more memory-efficient than SuperGlue; handles large multi-sensor images efficiently.
**3. Where it appears in the pipeline:** Feature Matching (Module 4).
**4. Input:** SuperPoint features from image pairs.
**5. Output:** Putative matched correspondences and confidence scores.
**6. Strengths:** Adaptive computation (fewer iterations on easy pairs).
**7. Failure cases:** May struggle when spectral differences completely invert local gradients (e.g., IR vs Vis in some bands).

## RIFT2
**1. What it does:** Extracts and matches features using phase congruency, augmented with a fast rotation-invariant hashing scheme.
**2. Why we use it:** Specifically designed for multimodal matching under nonlinear radiometric distortions (NRD).
**3. Where it appears in the pipeline:** Feature Matching (Module 4) - as a fallback.
**4. Input:** Normalized Image pairs.
**5. Output:** Matched correspondences.
**6. Strengths:** Highly robust to non-linear intensity changes between visible and IR. Fast (due to RIFT2 improvements over RIFT).
**7. Limitations:** Slightly slower than LightGlue; may extract fewer overall points.

## Spatial Bucketing
**1. What it does:** Divides the image into a grid of cells (e.g., 8x8 or 16x16) and caps the number of matches in each cell, backfilling sparsely populated cells.
**2. Why we use it:** To satisfy the SIH requirement for uniform match distribution.
**3. Where it appears in the pipeline:** Match Regularization (Module 5).
**4. Input:** Candidate matches.
**5. Output:** Uniformly distributed subset of matches.
**6. Strengths:** Prevents overfitting to highly textured areas (like craters) and ensures stable geometric fitting across the whole scene.

## MAGSAC++
**1. What it does:** A robust model fitting algorithm (a RANSAC variant) that marginalizes over possible inlier thresholds and uses a Progressive NAPSAC sampler.
**2. Why we use it:** Provides superior accuracy and speed over standard RANSAC by eliminating the need for a hard inlier threshold.
**3. Where it appears in the pipeline:** Robust Geometric Fitting (Module 6).
**4. Input:** Filtered candidate matches.
**5. Output:** Geometric transform (homography/affine) and the final inlier set.
**6. Strengths:** Highly accurate outlier rejection; finds local structures early.

## Thin Plate Splines (TPS)
**1. What it does:** Computes a smooth, non-rigid 2D interpolation (warp) that exactly aligns the given control points (inliers).
**2. Why we use it:** A single global homography cannot map perspective changes over the non-planar lunar relief. TPS provides local flexibility.
**3. Where it appears in the pipeline:** Local Deformation (Module 7).
**4. Input:** Inlier matches.
**5. Output:** Dense local deformation field / warped image.
**6. Limitations:** Susceptible to overfitting if control points are poorly distributed (mitigated by Spatial Bucketing).

## Phase Correlation
**1. What it does:** Uses FFT-based cross-correlation on small patches (e.g., 32x32) to estimate translative offsets between two images.
**2. Why we use it:** Achieves sub-pixel precision for the final registration.
**3. Where it appears in the pipeline:** Sub-Pixel Refinement (Module 8).
**4. Input:** Local patches extracted around inlier matches in the roughly-warped images.
**5. Output:** Sub-pixel shift (dx, dy).
**6. Strengths:** Robust to uniform intensity changes; extremely precise for translative shifts.
**7. Failure cases:** Fails if patches contain strong rotation or severe perspective distortion (which should be solved in earlier stages).

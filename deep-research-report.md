# Multi-sensor Chandrayaan-2 Image Registration

Chandrayaan-2’s orbiter carries three optical imagers – the **Imaging Infra-Red Spectrometer (IIRS)**, **Orbiter High-Resolution Camera (OHRC)**, and **Terrain Mapping Camera-2 (TMC-2)** – with very different resolutions and spectra. IIRS is a hyperspectral imager (800–5000 nm, ~256 bands at 80 m/pixel); TMC-2 is a panchromatic stereo camera at 5 m/pixel; and OHRC is a very-high-resolution panchromatic camera (0.25 m/pixel).  All data are archived in NASA/PDS4 format. To co-register images from these sensors taken under different scales, perspectives, and illumination, the pipeline proceeds through several stages: data ingestion, coarse geometric alignment, illumination normalization, feature matching, match regularization, robust fitting, sub-pixel refinement, and final product generation.  

 *Figure: Examples of Chandrayaan-2 IIRS image strips (white rectangles) overlaid on an LRO-WAC lunar mosaic.  Each strip spans tens of kilometers.  (From Bose et al. (2025), four sample IIRS bands on the lunar maria.)*  

## Data Ingestion and Metadata

We first ingest each image’s PDS4 label to extract geometry and illumination parameters.  PDS4 labels contain spacecraft ephemeris and pointing (orbit and attitude) as well as **Sun azimuth/elevation** and sensor metadata (including nominal ground-sampling-distance, GSD). For example, the IIRS label gives line-by-line latitude/longitude at coarse intervals, and RPC-like coefficients can often be computed from these metadata.  The pipeline must parse the XML labels and store the sun angles and effective GSD so that each image’s radiance data can later be converted to reflectance and aligned in a common map geometry.  (Chandrayaan-2 data are publicly available via ISRO’s PRADAN archive, which we cite for data context.)  

- *Key references:* IIRS metadata and seleno-referencing have been studied by Bose et al., who note that IIRS Level-1 radiance cubes lack built-in map projection.  They highlight that PDS4 geometry alone is insufficiently precise for direct mapping, motivating our automated approach.  

## Coarse Geometric Alignment via DEM Projection

Next, each input image is projected to a common lunar DEM.  We use a global DEM (e.g. the merged LRO-LOLA/Kaguya 59 m DEM) or a higher-resolution DEM if available (e.g. from TMC-2 stereo).  Using the sensor’s push-broom or frame model (RPC, or a collinearity model), each pixel is ray-traced to the DEM and its latitude/longitude computed.  The images are then resampled onto a common projection grid (e.g. a standard lunar map or one sensor’s frame) at uniform ground spacing.  This step removes most **scale and perspective differences**: for example, differences in camera altitude or view angle are largely eliminated because all imagery is now ground-projected onto the same surface.  

In practice we implement this via standard photogrammetric tools or custom warping: given sensor orientation and DEM heights, one computes each pixel’s surface coordinate.  Because IIRS had rough metadata, one may first do a coarse alignment (e.g. via manually matched tiepoints) to get an initial transform; thereafter projection to DEM refines the geometry.  This coarse “orthorectification” ensures that subsequent feature matching is nearly on-level terrain.  It also equalizes the ground sampling distance, since all images are resampled to the DEM’s grid (e.g. 20 m or 5 m/pixel) regardless of original GSD.  

- *Key ideas:* Projecting to a DEM implicitly accounts for crater and relief.  Previous work on IIRS “selenoreferencing” often uses LRO-WAC or other reference maps.  Our DEM-based orthorectification goes further by using topography to remove parallax.  

## Illumination Normalization

After geometric alignment, images still differ in brightness and contrast due to different Sun angles and sensor responses.  We apply both general histogram techniques (CLAHE and histogram matching, as in baseline methods) **and** a physics-based photometric correction.  CLAHE (contrast-limited adaptive histogram equalization) locally equalizes contrast, and histogram-matching aligns the overall tonal distribution between images.  In addition, we use the known Sun incidence and emission angles (from each PDS4 label) to perform a **sun-angle correction**.  For example, assuming a Lambertian or lunar photometric phase function, one can scale observed radiance by $\cos(i)$ (where $i$ is solar incidence) or by a Hapke-like model to reference all pixels to a common illumination geometry.  

This step follows the principle that “photometric correction of lunar images… is required to normalize images acquired at different observational angles into a standard viewing geometry”.  In practice we compute, for each pixel, its local incidence angle via the DEM and adjust its brightness to what it would be at a standard Sun elevation (e.g. 30° incidence).  The net effect is to reduce contrast differences caused by one image being taken near dawn vs another near noon.  

- *Key references:* Bose et al. (2023) discuss photometric correction of Chandrayaan-2 IIRS data; earlier HySI work showed such corrections align reflectance to standard angles. Our approach similarly aims to convert radiances to approximate surface reflectance.  

## Multi-modal Feature Matching

With images roughly on the same map and normalized radiometrically, we extract features and match across sensor pairs.  We use **LightGlue** (with SuperPoint keypoints) as the primary matcher.  LightGlue is a recent sparse matching network that learns correspondences between SuperPoint features.  Compared to SuperGlue, LightGlue is much faster and adaptive: it requires fewer iterations on “easy” image pairs and uses less memory.  This makes it well-suited for large multi-sensor images.  When LightGlue’s confidence (or number of matches) is low, especially for very different modalities, we fall back on **RIFT2**.  RIFT2 is a feature extractor designed for **multimodal** image matching under nonlinear radiometric distortions.  It builds on the original RIFT (based on phase congruency) but adds a faster rotation-invariant hashing, making it ~3× faster while retaining similar robustness.  In practice, we run LightGlue on each image pair; if inlier yields are poor, we also run RIFT2 to capture points that LightGlue might miss in, e.g., IR vs visible bands.  

Each matcher produces a set of tentative correspondences (with confidence scores).  Because sensors have different point of view, we limit matches to within reasonable epipolar or local-neighborhood constraints after DEM projection.  We then filter or merge the two match sets (LightGlue + RIFT2) to form a union of candidate matches.  

- *Key references:* LightGlue “learns to match local features across images” and is adaptive to problem difficulty.  RIFT2 achieves robustness to nonlinear radiation changes (“NRD-insensitive”) and speedups by a new rotation-invariance scheme.  

## Uniform Spatial Distribution of Matches

The problem statement explicitly requests a uniform distribution of tiepoints.  To satisfy this, we enforce a grid-based “bucketing” of matches.  The image is divided into a grid of equally-sized cells (e.g. 8×8 or 16×16).  In each cell, we cap the number of matches (to avoid dense clumps) and, if needed, add more from less-populated cells (“backfill”) until a roughly uniform count per cell is achieved.  This ensures that matches cover all areas of the image rather than clustering, which improves the stability of subsequent geometric fitting.  

Such bucketed sampling of correspondences is a standard practice in photogrammetry (often called “bucketing” or “stratified sampling”) to avoid overfitting to textured regions.  (Though seldom explicitly mentioned in recent vision papers, this was commonly used in early SIFT/RANSAC pipelines.)  

- *Key idea:* This match regularization ensures that even if some regions are low-contrast, we still attempt to place some matches there, aligning with the SIH requirement for uniform coverage.  

## Robust Geometric Fitting (MAGSAC++ and Local Warping)

We now fit a geometric transform to the correspondences.  A single global homography is often insufficient for lunar scenes (relief varies, so planarity breaks down over craters).  Instead, we use a **piecewise or non-rigid** model. First, we apply **MAGSAC++** to robustly estimate an initial transform.  MAGSAC++ is a RANSAC variant that replaces the hard inlier threshold with a marginalization over possible thresholds, yielding more reliable fits.  It also uses a “Progressive NAPSAC” sampler that finds local structures early, further improving speed and accuracy.  On real datasets, MAGSAC++ achieves faster, more accurate model estimation than plain RANSAC.  

Rather than fitting a single model to the whole image, we use a **local deformation model** such as thin-plate-spline (TPS).  In practice, we divide the image into overlapping tiles or use the TPS warp on all inliers: TPS finds a smooth 2D warp that exactly matches the inlier tiepoints, allowing local flexibility.  Thin-plate-splines are well-known for image registration in GIS, correcting local distortions where a global transform fails.  Thus, our pipeline may first estimate a global homography (or affine) to roughly align the scene, then fit a TPS on the inliers for fine detail.  

- *Key references:* Barath et al. (2019) introduced MAGSAC++, which “produces results superior to state-of-the-art robust methods” on homography/fundamental fitting.  We adopt MAGSAC++ in place of plain RANSAC for better outlier handling.  For very non-planar terrain, using a deformation model (e.g. TPS) accommodates warps that a single homography cannot.  

## Sub-Pixel Refinement (Phase Correlation)

After robust fitting, we refine each surviving match to sub-pixel accuracy.  For each matched point, we extract small local patches around the putative correspondences in both images (e.g. 32×32 pixels).  We then apply a **phase correlation** (FFT-based cross-correlation) on the patches.  Phase correlation estimates the translative offset between two similar images in the frequency domain. By locating the peak of the inverse Fourier cross-spectrum, we compute the shift with sub-pixel precision (typically by interpolating around the peak).  This yields a refined offset (dx, dy) between each patch center beyond the integer grid.  Since phase correlation is robust to uniform intensity changes and only measures translation, it is well-suited to small alignment refinement.  

- *Key references:* Phase correlation is a classic image registration method: it finds the relative shift between images via the normalized cross-power spectrum.  Its peak can be interpolated to achieve sub-pixel registration.  

## Registered Product Generation

Finally, with all correspondences and transforms established, we resample (warp) the source image onto the reference image’s grid.  We use the computed local transform (e.g. TPS) to map each source pixel to target coordinates, and interpolate (e.g. bilinear or cubic) to create the registered image.  The result is saved as a GeoTIFF or other georeferenced raster, which includes the projection and geo-tags from the reference frame.  This registered image has the same map projection and scale as the reference, with sub-pixel-aligned multimodal content.  

## Evaluation Metrics

We evaluate the registration using several metrics: **RMSE of tiepoints**, **inlier ratio**, **match uniformity score**, and **processing time**.  RMSE (in meters) is computed as the average reprojection error of surviving matches on the DEM surface.  The inlier ratio is the fraction of initial matches deemed inliers by MAGSAC++.  The uniformity score measures how evenly distributed the final inliers are across image tiles (for example, we can compute the variance of match counts per grid cell).  Processing time is benchmarked against baselines.  We will compare these metrics directly to published results for SuperGlue and RIFT2 on similar lunar tasks, to quantify any improvements.  

**Summary:** This pipeline ingests PDS4 metadata, orthorectifies all images to a common DEM and grid (neutralizing scale/viewpoint differences), applies histogram and sun-angle corrections, extracts and matches features with LightGlue/RIFT2, enforces spatially uniform matches, fits a robust local warp (MAGSAC++ and TPS), refines at sub-pixel precision (phase correlation), and outputs georeferenced imagery.  Throughout, we rely on recent advances (LightGlue, RIFT2, MAGSAC++) combined with classical steps to achieve sun-angle–invariant, scale-invariant multimodal registration.  

**Sources:** Chandrayaan-2 instrument details and data format are from ISRO/ISSDC documentation.  Prior work on automated IIRS registration and photometric correction is reviewed in Bose et al. (2025).  Feature-matching methods (LightGlue, RIFT2) and robust-fitting (MAGSAC++) are cited from their publications.  General techniques like phase correlation for subpixel alignment are cited from standard references. All design choices are grounded in these sources and in the problem requirements.
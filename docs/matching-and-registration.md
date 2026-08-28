# Matching and Registration

After Geometric and Photometric Normalization (preprocessing), the images exist on a somewhat common ground grid and illumination plane, but they still contain local misalignments and residual errors. The Matching and Registration pipeline resolves these.

## 1. Feature Extraction & Candidate Correspondence
SuperPoint (or RIFT2) extracts key features from the normalized source and reference images. LightGlue then generates a set of candidate correspondences. Due to residual DEM inaccuracies or minor sensor model errors, the initial orthorectification is imperfect. These candidate matches will serve as tiepoints to solve these residuals.

## 2. Confidence Filtering
Initial matches are filtered based on the confidence scores output by LightGlue (or RIFT2 phase congruency metrics) and constrained by logical epipolar bounds to remove egregious outliers immediately.

## 3. Spatial Bucketing
A core SIH requirement is uniform match distribution. A simple feature matcher will heavily cluster matches around a single, highly-textured crater, leaving smooth plains unmatched.
- The image is divided into a grid of cells.
- A maximum capacity is enforced per cell.
- Matches are sampled from dense cells, and less-populated cells are backfilled.
This guarantees uniform tiepoints, essential for a stable local warp later.

## 4. Robust Fitting with MAGSAC++
Standard RANSAC uses a hard distance threshold to classify inliers/outliers, which is brittle.
- **MAGSAC++** is applied to the uniformly bucketed tiepoints.
- It marginalizes over possible thresholds, providing a highly robust outlier rejection mechanism.
- It computes a global transform (like an Affine or Homography matrix) that roughly aligns the overall scene.

## 5. Why Not Just a Homography?
A single global homography mathematically assumes the scene is perfectly planar. While DEM projection handles large-scale relief, small local residuals remain (due to DEM resolution limits). A single homography cannot map these non-planar residuals—it will correctly align one crater but stretch and misalign another.

## 6. TPS / Local Deformation
To handle non-planar terrain, a piecewise, non-rigid model is required.
- **Thin Plate Splines (TPS)** use the MAGSAC++ inliers as control points to generate a smooth, non-rigid 2D deformation field.
- This allows local flexibility, warping the image accurately around local craters and bumps where a global transform would fail.

## 7. Phase-Correlation Refinement
Even after TPS, matches are usually only accurate to integer pixel boundaries.
- Small patches (e.g., 32x32 pixels) are extracted around the inlier tiepoints.
- **Phase Correlation** (FFT cross-correlation) is executed on these patches.
- The peak of the inverse Fourier cross-spectrum provides a translative offset (dx, dy) with sub-pixel precision.
- The final TPS warp is updated with these sub-pixel shifts, generating the final registered product.

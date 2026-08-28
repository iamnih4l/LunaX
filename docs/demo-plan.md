# Demo Plan

This document outlines the step-by-step flow for the live hackathon demonstration of the LunaX pipeline.

### Step 1: Input OHRC/TMC/IIRS Imagery
- **What is shown:** The raw PDS4 images loaded side-by-side.
- **Notice:** The massive scale difference, the different visual textures (hyperspectral vs panchromatic), and the different shadow angles.
- **Proves:** The complexity of the SIH problem statement.

### Step 2: Raw Alignment
- **What is shown:** An attempt to simply overlay the images based solely on rough coordinates.
- **Notice:** They do not align; craters are shifted, scales are wrong.
- **Proves:** Why simple registration is insufficient.

### Step 3: DEM/Geometric Normalization
- **What is shown:** The images projected onto the 3D DEM and flattened to a 2D map.
- **Notice:** The 80m IIRS and 0.25m OHRC images now occupy the same physical footprint dimensions.
- **Proves:** Scale and perspective invariance.

### Step 4: Photometric Normalization
- **What is shown:** A split-screen of the image before and after Cos(i) and CLAHE correction.
- **Notice:** Harsh shadows from dawn/dusk angles are softened; the images look as if they were taken under similar lighting.
- **Proves:** Sun angle invariance.

### Step 5: Feature Correspondences
- **What is shown:** Lines connecting matched points between the two images.
- **Notice:** The AI (LightGlue/RIFT2) successfully finds matching craters even between the blurry IR image and the sharp visible image.
- **Proves:** Multi-modal invariance.

### Step 6: Uniform Tiepoints (Spatial Bucketing)
- **What is shown:** A grid overlaid on the image, with match points evenly distributed in every box.
- **Notice:** Matches aren't just clumped in the center; they cover the edges and smooth plains too.
- **Proves:** Adherence to the SIH "uniform distribution" requirement.

### Step 7: Inlier/Outlier Filtering
- **What is shown:** MAGSAC++ turning bad matches red (outliers) and good matches green (inliers).
- **Notice:** Egregious errors crossing the screen are removed.
- **Proves:** Robust mathematical filtering.

### Step 8: Final Warp (TPS)
- **What is shown:** A grid warping non-rigidly over the image to snap the green tiepoints perfectly together.
- **Notice:** The transformation is not just a flat rotation/scale; it bends locally.
- **Proves:** Handling of non-planar lunar relief.

### Step 9: Sub-pixel Refinement
- **What is shown:** A zoomed-in 32x32 pixel patch showing the phase correlation peak shifting the alignment by fractions of a pixel.
- **Notice:** The extreme precision.
- **Proves:** Sub-pixel accuracy requirement.

### Step 10: Final Registered Output
- **What is shown:** A slider UI where the judge can wipe back and forth between the reference image and the registered source image.
- **Notice:** Craters and ridges remain perfectly stationary during the wipe.
- **Proves:** The pipeline works end-to-end.

### Step 11: Evaluation Metrics
- **What is shown:** A dashboard displaying the Tiepoint RMSE, Inlier Ratio, Uniformity Variance, and Runtime.
- **Notice:** Hard numbers backing up the visual success.
- **Proves:** Scientific rigor and evaluation criteria met.

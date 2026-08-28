# Evaluation

A rigorous evaluation plan is required to benchmark the performance of the LunaX registration pipeline.

## Evaluation Metrics

### 1. Tiepoint RMSE (Root Mean Square Error)
**Definition:** Measures the geometric distance between corresponding tiepoints after the final transform has been applied.
**Calculation:** 
Computed as the average Euclidean reprojection error of surviving inlier matches on the DEM surface (measured in meters).
$$RMSE = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (x'_i - T(x_i))^2 + (y'_i - T(y_i))^2}$$
Where $T(x_i, y_i)$ is the transformed source point, and $(x'_i, y'_i)$ is the reference point.

### 2. Inlier Ratio
**Definition:** Evaluates the robustness and accuracy of the initial feature matching phase. A higher inlier ratio indicates cleaner, more reliable initial matches.
**Calculation:**
```text
Inlier Ratio = (Number of geometrically valid matches (MAGSAC++ inliers)) / (Total candidate matches (LightGlue+RIFT2))
```

### 3. Match Uniformity Score
**Definition:** Measures how evenly the final inliers are distributed across the physical image space.
**Calculation:**
The image is divided into a spatial grid (e.g., $16 \times 16$ cells). We count the number of tiepoints $c_j$ in each cell $j$.
The uniformity score is the **variance of match counts across cells**. A lower variance indicates a more uniform distribution.

### 4. Processing Time
**Definition:** Measures the computational efficiency of the pipeline.
**Calculation:** Total end-to-end execution time (seconds), as well as profiling individual modules (e.g., time spent in LightGlue vs. TPS warp).

## Evaluation Matrix

We will compare our proposed pipeline against baselines (e.g., standard SIFT+RANSAC without DEM projection, or SuperGlue alone).

| Experiment | Method | RMSE (m) | Inlier Ratio | Uniformity (Variance) | Runtime (s) |
| ---------- | ------ | ---: | -----------: | ---------: | ------: |
| Baseline 1 | SIFT + RANSAC + Global Homography | ... | ... | ... | ... |
| Baseline 2 | SuperPoint + SuperGlue + RANSAC | ... | ... | ... | ... |
| Proposed   | DEM + LightGlue/RIFT2 + MAGSAC++ + TPS | ... | ... | ... | ... |

*(Note: Exact values will be populated post-implementation.)*

# System Architecture

The LunaX pipeline is divided into distinct, modular components, each responsible for a specific stage of the registration process.

### Module 1 — Data Ingestion
**Responsibilities:**
* locate input files,
* parse PDS4 labels,
* load imagery,
* validate metadata.

### Module 2 — Geometry Engine
**Responsibilities:**
* sensor geometry,
* DEM intersection,
* orthorectification,
* common coordinate system.

### Module 3 — Photometric Normalization
**Responsibilities:**
* illumination normalization,
* histogram processing,
* CLAHE,
* optional physics-based correction.

### Module 4 — Feature Matching
**Responsibilities:**
* SuperPoint,
* LightGlue,
* RIFT2 fallback,
* confidence scoring.

### Module 5 — Match Regularization
**Responsibilities:**
* spatial bucketing,
* uniform tiepoint distribution,
* filtering.

### Module 6 — Robust Registration
**Responsibilities:**
* MAGSAC++,
* inlier selection,
* transformation estimation.

### Module 7 — Local Deformation
**Responsibilities:**
* TPS/local warping,
* terrain-related residual deformation.

### Module 8 — Sub-pixel Refinement
**Responsibilities:**
* local patch extraction,
* phase correlation,
* sub-pixel displacement estimation.

### Module 9 — Product Generation
**Responsibilities:**
* image warping,
* interpolation,
* GeoTIFF generation,
* metadata preservation.

### Module 10 — Evaluation
**Responsibilities:**
* RMSE,
* inlier ratio,
* spatial uniformity,
* processing time.

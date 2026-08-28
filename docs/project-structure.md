# Project Structure

The LunaX repository will be organized into a modular structure to separate data ingestion, core algorithms, and evaluation scripts.

```text
LunaX/
│
├── data/                    # Ignored by git; stores raw PDS4 and DEM files
│   ├── ohrc/
│   ├── tmc/
│   ├── iirs/
│   └── dem/
│
├── configs/                 # YAML/JSON configurations for hyperparameters
│
├── docs/                    # Project documentation (this directory)
│
├── src/                     # Core pipeline source code
│   ├── ingestion/           # PDS4 XML parsing and image loading
│   ├── geometry/            # DEM ray-tracing and orthorectification
│   ├── photometry/          # CLAHE, Histogram Matching, Cos(i) correction
│   ├── features/            # SuperPoint and RIFT2 extraction wrappers
│   ├── matching/            # LightGlue and fallback logic
│   ├── registration/        # Spatial bucketing, MAGSAC++, TPS warping
│   ├── refinement/          # Phase correlation sub-pixel shifts
│   ├── products/            # GeoTIFF generation and metadata preservation
│   └── evaluation/          # RMSE, inlier ratio, uniformity calculations
│
├── scripts/                 # CLI entry points (e.g., run_pipeline.py)
├── tests/                   # Unit tests for individual modules
├── notebooks/               # Jupyter notebooks for prototyping and visualization
├── outputs/                 # Final registered GeoTIFF products
└── README.md                # Root project overview
```

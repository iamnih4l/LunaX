# Data Flow

The data flow dictates how information moves and transforms through the system, bridging the raw sensor telemetry to the final registered product.

## End-to-End Flow

```text
PDS4 XML + Image
        ↓
Metadata Parser
        ↓
Geometry + Sun Parameters
        ↓
DEM Projection
        ↓
Orthorectified Image
        ↓
Photometric Normalization
        ↓
Normalized Image
        ↓
Feature Matching
        ↓
Candidate Tiepoints
        ↓
Match Regularization (Bucketing)
        ↓
Uniform Candidate Tiepoints
        ↓
Robust Fitting (MAGSAC++)
        ↓
Inlier Tiepoints + Global Transform
        ↓
Local Deformation (TPS)
        ↓
Local Transformation Warp Field
        ↓
Sub-pixel Refinement
        ↓
Refined Sub-pixel Offsets
        ↓
Product Generation
        ↓
Registered Product (GeoTIFF)
```

## Formats and Representations

* **Image Formats:** PDS4 Image data (raw blocks, PDS formats). Intermediate representations should be standard 2D/3D Tensors/NumPy Arrays (float32). Output is standard GeoTIFF.
* **Metadata Formats:** PDS4 XML (input). Internal representation: Custom Dictionary/JSON objects storing Sun elevation, azimuth, and GSD.
* **Intermediate Representations:**
  - Feature descriptors: 1D Tensors.
  - Keypoints: (x, y) coordinate arrays.
  - Matches: Arrays of indices linking (x1, y1) to (x2, y2).
* **Coordinate Systems:** Raw Pixel Coordinates (Sensor Frame) -> Map Coordinates (Lat/Lon via DEM) -> Target Pixel Coordinates.
* **Expected Tensor/Array Representations:** `[C, H, W]` arrays normalized to `[0, 1]` or suitable floating-point ranges for feature extractors. `[TO VERIFY]` specific tensor formats required by LightGlue/RIFT2 in the implementation.
* **Final Output Formats:** GeoTIFF with preserved spatial metadata.

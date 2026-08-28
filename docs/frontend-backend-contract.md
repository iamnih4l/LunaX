# LunaX — Frontend–Backend Data Contract

This document defines the data structures the frontend expects from the backend API.
When the real backend is implemented, API responses should conform to these structures.

## Base Types

### SensorId
```typescript
type SensorId = 'OHRC' | 'TMC2' | 'IIRS';
```

### SensorMetadata
```json
{
  "id": "OHRC",
  "name": "OHRC",
  "fullName": "Orbiter High-Resolution Camera",
  "gsd": 0.25,
  "gsdUnit": "m/pixel",
  "spectralType": "PAN",
  "description": "Very-high-resolution panchromatic camera"
}
```

---

## Observation

### ImageMetadata
```json
{
  "id": "ohrc-mare-imbrium-001",
  "sensor": "OHRC",
  "filename": "ch2_ohrc_ncp_20200115T034512.pds4",
  "dimensions": { "width": 4096, "height": 16384 },
  "gsd": 0.25,
  "footprint": {
    "center": { "lat": 32.8, "lon": -15.6 },
    "bounds": { "north": 33.2, "south": 32.4, "east": -15.2, "west": -16.0 },
    "vertices": [
      { "lat": 33.2, "lon": -16.0 },
      { "lat": 33.2, "lon": -15.2 },
      { "lat": 32.4, "lon": -15.2 },
      { "lat": 32.4, "lon": -16.0 }
    ]
  },
  "acquisition": { ... },
  "thumbnailUrl": "string (optional)",
  "previewUrl": "string (optional)"
}
```

### AcquisitionGeometry
```json
{
  "orbitNumber": 12847,
  "acquisitionTime": "2020-01-15T03:45:12Z",
  "sunElevation": 42.3,
  "sunAzimuth": 178.5,
  "incidenceAngle": 47.7,
  "emissionAngle": 3.2,
  "phaseAngle": 45.1,
  "spacecraftAltitude": 100,
  "viewingAngle": 2.1
}
```

---

## Processing Pipeline

### ProcessingStage
```json
{
  "id": "feature_matching",
  "name": "Feature Matching",
  "shortName": "MATCHING",
  "method": "LightGlue + RIFT2",
  "status": "RUNNING",
  "progress": 0.65,
  "message": "Computing attention-based matches...",
  "startedAt": "2025-01-15T03:45:12Z",
  "completedAt": null
}
```

**Status values:** `PENDING` | `RUNNING` | `COMPLETED` | `FAILED`

### ProcessingJob
```json
{
  "id": "job-123",
  "sourceImage": { ... },
  "referenceImage": { ... },
  "stages": [ ... ],
  "currentStage": "feature_matching",
  "overallProgress": 0.45,
  "status": "RUNNING",
  "createdAt": "2025-01-15T03:45:12Z"
}
```

### StageId Values
```
pds4_ingestion | metadata_extraction | dem_projection |
photometric_normalization | feature_extraction | feature_matching |
match_regularization | robust_fitting | local_warping |
subpixel_refinement | product_generation
```

---

## Feature Matching

### FeaturePoint
```json
{
  "x": 512.4,
  "y": 384.2,
  "confidence": 0.92,
  "scale": 1.0
}
```

### Correspondence
```json
{
  "id": 0,
  "source": { "x": 512.4, "y": 384.2, "confidence": 0.92 },
  "reference": { "x": 510.1, "y": 382.8, "confidence": 0.89 },
  "confidence": 0.91,
  "isInlier": true,
  "method": "LightGlue",
  "bucketCell": { "row": 8, "col": 10 }
}
```

**Method values:** `LightGlue` | `RIFT2`

---

## Registration Results

### EvaluationMetrics
```json
{
  "rmse": 0.47,
  "inlierRatio": 0.847,
  "uniformityScore": 0.023,
  "processingTime": 18.4,
  "totalMatches": 1284,
  "totalInliers": 1037,
  "gridSize": { "rows": 16, "cols": 16 },
  "cellCounts": [ [3, 5, 4, ...], ... ]
}
```

### RegistrationResult
```json
{
  "jobId": "job-123",
  "status": "SUCCESS",
  "metrics": { ... },
  "correspondences": [ ... ],
  "registeredProductUrl": "/api/v1/products/job-123/registered.tif",
  "sourcePreviewUrl": "/api/v1/products/job-123/source_preview.png",
  "referencePreviewUrl": "/api/v1/products/job-123/reference_preview.png",
  "overlayPreviewUrl": "/api/v1/products/job-123/overlay_preview.png",
  "differencePreviewUrl": "/api/v1/products/job-123/difference_preview.png"
}
```

**Status values:** `SUCCESS` | `PARTIAL` | `FAILED`

---

## API Endpoints (Expected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sensors` | List sensor specifications |
| GET | `/api/v1/observations` | List available observations |
| GET | `/api/v1/observations/:id` | Get single observation |
| POST | `/api/v1/register` | Start registration job |
| WS | `/api/v1/ws/jobs/:id` | WebSocket for job progress |
| GET | `/api/v1/jobs/:id/result` | Get registration result |
| GET | `/api/v1/products/:id/:file` | Download product files |
| POST | `/api/v1/export/:jobId` | Generate export report |

---

## Error Response Format

```json
{
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "Feature matching produced insufficient inliers",
    "stage": "feature_matching"
  }
}
```

---

## Notes

- All coordinate values use degrees (WGS84 lunar equivalent)
- Timestamps are ISO 8601 UTC
- Image URLs may be relative paths or full URLs
- The frontend does not assume any specific backend technology
- The frontend uses `isDemoMode: boolean` to toggle demo labels

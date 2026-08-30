# Frontend-Backend Contract

This document defines the strict contract between the frontend and the backend. The backend is the single source of truth for processing logic and scientific validation. The frontend must consume this API directly without assuming internal implementation details.

## Real Backend Endpoints

### 1. Registration Initialization
**Endpoint:** `POST /api/v1/register`  
**Purpose:** Initiates a new registration pipeline job between a source and reference dataset.

**Request Body (JSON):**
```json
{
  "source_sensor": "IIRS",
  "reference_sensor": "OHRC",
  "source_dataset_id": "ch2_iirs_ncp_20200305T142256.pds4",
  "reference_dataset_id": "ch2_ohrc_ncp_20200115T034512.pds4",
  "options": {
    "feature_method": "auto",
    "photometric_model": "lommel_seeliger",
    "grid_size": 32,
    "max_keypoints": 2048,
    "confidence_threshold": 0.75
  }
}
```
*(Note: The actual `schemas.py` specifies `source_dataset_id`, while the old frontend incorrectly sent `source_path`.)*

**Response (JSON):**
```json
{
  "job_id": "uuid-string",
  "status": "pending",
  "created_at": "2026-08-30T10:00:00Z",
  "estimated_time": 120.0
}
```

### 2. Job Status Polling
**Endpoint:** `GET /api/v1/jobs/{job_id}`  
**Purpose:** Fallback mechanism for getting the status of a job if WebSockets are unavailable.

**Response (JSON):**
```json
{
  "status": "pending | processing | completed | failed",
  "progress": 45.5,
  "stage_name": "FEATURE_MATCHING",
  "metrics": {
    "rmse": 1.2,
    "inlier_ratio": 0.85
  }
}
```

### 3. Real-time Job Updates
**Endpoint:** `WS /api/v1/ws/jobs/{job_id}`  
**Purpose:** Streams real-time pipeline status and progress.

**Message Format (JSON):**
```json
{
  "status": "processing",
  "progress": 45.5,
  "stage": "FEATURE_MATCHING",
  "message": "Extracting features using SuperPoint..."
}
```

### 4. File Upload (Optional/Future)
**Endpoint:** `POST /api/v1/upload`  
**Purpose:** Uploading raw PDS4 files. (Multipart form data).

### 5. Health Check
**Endpoint:** `GET /health`  
**Purpose:** System health verification.

## Error Handling Contract
- The backend will return HTTP status codes `404` for missing jobs, or standard HTTP errors (`500`, `422` for validation errors).
- The WebSocket streams failures as `{ "status": "failed", "message": "Error details" }`.
- The frontend **MUST** display intentional error UI states for these scenarios. Blank screens are strictly forbidden.

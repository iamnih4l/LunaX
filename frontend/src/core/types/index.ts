/**
 * LunaX Frontend Domain Models
 * These types represent the internal UI state and are totally decoupled 
 * from how the backend happens to shape its JSON responses.
 */

export type SensorId = 'OHRC' | 'TMC2' | 'IIRS' | 'CUSTOM' | 'MANUAL';

export interface InternalObservation {
  id: string; // The ID used internally by the UI
  datasetId: string; // The ID expected by the backend
  sensor: SensorId;
  previewUrl: string;
  gsd: number; // Ground sample distance in m/pixel
  acquisitionTime: string;
  // Bounding box for 3D mapping
  footprint: {
    center: { lat: number; lon: number };
    vertices: { lat: number; lon: number }[];
  };
}

export type JobStatusState = 'IDLE' | 'VALIDATING' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface InternalJobStatus {
  jobId: string;
  status: JobStatusState;
  progress: number; // 0 to 100
  stageName: string;
  message: string;
  metrics?: InternalMetrics;
}

export interface InternalMetrics {
  rmse: number;
  inlierRatio: number;
  totalMatches: number;
  inlierCount: number;
}

export interface InternalMatchPoint {
  sourceX: number;
  sourceY: number;
  refX: number;
  refY: number;
  confidence: number;
  isInlier: boolean;
}

// Processing options available to the user
export interface RegistrationOptions {
  featureMethod: 'auto' | 'deep' | 'rift2';
  photometricModel: 'lommel_seeliger' | 'minnaert' | 'none';
  gridSize: number;
}

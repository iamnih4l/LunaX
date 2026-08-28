/* ─── LunaX API Contract Types ─── */

/* ─── Sensor Types ─── */
export type SensorId = 'OHRC' | 'TMC2' | 'IIRS';

export interface SensorMetadata {
  id: SensorId;
  name: string;
  fullName: string;
  gsd: number;          // meters/pixel
  gsdUnit: string;
  spectralType: string;
  spectralRange?: string;
  bands?: number;
  description: string;
}

/* ─── Acquisition & Geometry ─── */
export interface AcquisitionGeometry {
  orbitNumber: number;
  acquisitionTime: string;     // ISO 8601
  sunElevation: number;        // degrees
  sunAzimuth: number;          // degrees
  incidenceAngle: number;      // degrees
  emissionAngle: number;       // degrees
  phaseAngle: number;          // degrees
  spacecraftAltitude: number;  // km
  viewingAngle: number;        // degrees
}

export interface ImageFootprint {
  center: { lat: number; lon: number };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  vertices: Array<{ lat: number; lon: number }>;
}

export interface ImageMetadata {
  id: string;
  sensor: SensorId;
  filename: string;
  dimensions: { width: number; height: number };
  gsd: number;
  footprint: ImageFootprint;
  acquisition: AcquisitionGeometry;
  thumbnailUrl?: string;
  previewUrl?: string;
}

/* ─── Processing Pipeline ─── */
export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type StageId =
  | 'pds4_ingestion'
  | 'metadata_extraction'
  | 'dem_projection'
  | 'photometric_normalization'
  | 'feature_extraction'
  | 'feature_matching'
  | 'match_regularization'
  | 'robust_fitting'
  | 'local_warping'
  | 'subpixel_refinement'
  | 'product_generation';

export interface ProcessingStage {
  id: StageId;
  name: string;
  shortName: string;
  method?: string;
  status: StageStatus;
  progress: number;        // 0.0 - 1.0
  message?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessingJob {
  id: string;
  sourceImage: ImageMetadata;
  referenceImage: ImageMetadata;
  stages: ProcessingStage[];
  currentStage?: StageId;
  overallProgress: number;
  status: StageStatus;
  createdAt: string;
}

/* ─── Feature Matching ─── */
export interface FeaturePoint {
  x: number;
  y: number;
  confidence: number;
  scale?: number;
}

export interface Correspondence {
  id: number;
  source: FeaturePoint;
  reference: FeaturePoint;
  confidence: number;
  isInlier: boolean;
  method: 'LightGlue' | 'RIFT2';
  bucketCell?: { row: number; col: number };
}

/* ─── Registration Results ─── */
export interface EvaluationMetrics {
  rmse: number | null;           // meters
  inlierRatio: number | null;    // 0.0 - 1.0
  uniformityScore: number | null; // variance of cell counts
  processingTime: number | null; // seconds
  totalMatches: number | null;
  totalInliers: number | null;
  gridSize: { rows: number; cols: number };
  cellCounts?: number[][];
}

export interface RegistrationResult {
  jobId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  metrics: EvaluationMetrics;
  correspondences: Correspondence[];
  registeredProductUrl?: string;
  sourcePreviewUrl?: string;
  referencePreviewUrl?: string;
  overlayPreviewUrl?: string;
  differencePreviewUrl?: string;
}

/* ─── App Views ─── */
export type AppView =
  | 'landing'
  | 'explorer'
  | 'acquisition'
  | 'workspace'
  | 'correspondence'
  | 'result'
  | 'report';

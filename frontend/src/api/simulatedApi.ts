/* ─── LunaX Simulated API Service ─── */
/* This module provides a clean abstraction over simulated data.
 * When the real backend is available, replace the implementations
 * inside these functions with actual HTTP calls.
 *
 * UI Components → simulatedApi → mock data
 *       (later)→ simulatedApi → real backend
 *
 * ALL DATA RETURNED BY THESE FUNCTIONS IS DEMO/SIMULATED.
 */

import type {
  ImageMetadata,
  ProcessingStage,
  Correspondence,
  EvaluationMetrics,
  RegistrationResult,
  StageStatus,
} from '../types';
import {
  DEMO_OBSERVATIONS,
  DEMO_REGIONS,
  SENSORS,
  createPipelineStages,
  generateDemoCorrespondences,
  DEMO_METRICS_POPULATED,
} from './mock';

/* ─── Types ─── */

export interface LunarRegion {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  description: string;
  availableObservations: number;
}

export interface PipelineProgressCallback {
  (update: {
    stageIndex: number;
    stage: ProcessingStage;
    overallProgress: number;
    message: string;
    correspondences?: Correspondence[];
    metrics?: EvaluationMetrics;
  }): void;
}

/* ─── Simulated Latency ─── */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ─── API Functions ─── */

/** Fetch all available lunar regions (simulated). */
export async function getRegions(): Promise<LunarRegion[]> {
  await delay(200);
  return DEMO_REGIONS;
}

/** Fetch all available observations, optionally filtered by region. */
export async function getObservations(_regionId?: string): Promise<ImageMetadata[]> {
  await delay(150);
  return DEMO_OBSERVATIONS;
}

/** Fetch a single observation by ID. */
export async function getObservation(id: string): Promise<ImageMetadata | null> {
  await delay(100);
  return DEMO_OBSERVATIONS.find((o) => o.id === id) || null;
}

/** Fetch acquisition geometry for an observation. */
export async function getGeometry(observationId: string): Promise<ImageMetadata['acquisition'] | null> {
  await delay(100);
  const obs = DEMO_OBSERVATIONS.find((o) => o.id === observationId);
  return obs?.acquisition || null;
}

/** Fetch sensor specifications. */
export async function getSensors() {
  await delay(50);
  return SENSORS;
}

/* ─── Pipeline Simulation ─── */

/** Stage-specific messages for the processing pipeline simulation. */
const STAGE_MESSAGES: Record<string, string[]> = {
  pds4_ingestion: [
    'Parsing PDS4 XML labels...',
    'Validating data integrity...',
    'Reading observation arrays...',
  ],
  metadata_extraction: [
    'Extracting ephemeris data...',
    'Computing sun geometry parameters...',
    'Building acquisition metadata...',
  ],
  dem_projection: [
    'Loading LRO-LOLA/Kaguya DEM (59m)...',
    'Ray-tracing 3D surface projection...',
    'Normalizing scale via DEM orthorectification...',
  ],
  photometric_normalization: [
    'Computing illumination model cos(i)...',
    'Applying CLAHE enhancement...',
    'Normalizing shadow variance...',
  ],
  feature_extraction: [
    'Running SuperPoint feature detector...',
    'Extracting 2,847 keypoints...',
    'Computing 256-dimensional descriptors...',
  ],
  feature_matching: [
    'Initializing LightGlue matcher...',
    'Computing attention-based matches...',
    'Running RIFT2 fallback for unmatched regions...',
    'Consolidating 1,284 correspondences...',
  ],
  match_regularization: [
    'Building 16×16 spatial bucket grid...',
    'Distributing matches across grid cells...',
    'Enforcing minimum 3 matches per cell...',
  ],
  robust_fitting: [
    'Running MAGSAC++ with adaptive threshold...',
    'Estimating fundamental matrix...',
    'Identifying 1,037 inlier correspondences...',
  ],
  local_warping: [
    'Computing Thin Plate Spline coefficients...',
    'Applying local deformation field...',
    'Minimizing residual geometric distortion...',
  ],
  subpixel_refinement: [
    'Extracting 32×32 correlation patches...',
    'Running FFT-based phase correlation...',
    'Achieving sub-pixel registration accuracy...',
  ],
  product_generation: [
    'Generating registered GeoTIFF...',
    'Writing spatial reference metadata...',
    'Computing final evaluation metrics...',
  ],
};

/** Stage timing (ms) for realistic pacing. */
const STAGE_TIMING: Record<string, number> = {
  pds4_ingestion: 1200,
  metadata_extraction: 800,
  dem_projection: 2000,
  photometric_normalization: 1500,
  feature_extraction: 1800,
  feature_matching: 2500,
  match_regularization: 1000,
  robust_fitting: 1800,
  local_warping: 1500,
  subpixel_refinement: 2000,
  product_generation: 1200,
};

/**
 * Simulate the full registration pipeline.
 * Calls `onProgress` as each stage transitions through RUNNING → COMPLETED.
 * Returns the final RegistrationResult.
 *
 * @param referenceImage - The reference observation
 * @param sourceImage - The source observation
 * @param onProgress - Callback fired for each stage update
 * @returns Final registration result
 */
export async function runCorrespondence(
  _referenceImage: ImageMetadata,
  _sourceImage: ImageMetadata,
  onProgress: PipelineProgressCallback
): Promise<RegistrationResult> {
  const stages = createPipelineStages('idle');
  const totalStages = stages.length;

  // Generate deterministic correspondences
  const correspondences = generateDemoCorrespondences(1284);

  for (let i = 0; i < totalStages; i++) {
    const stage = stages[i];
    const messages = STAGE_MESSAGES[stage.id] || ['Processing...'];
    const stageDuration = STAGE_TIMING[stage.id] || 1500;

    // Mark stage as RUNNING
    stage.status = 'RUNNING' as StageStatus;
    stage.progress = 0;
    stage.startedAt = new Date().toISOString();

    // Fire initial running update
    onProgress({
      stageIndex: i,
      stage: { ...stage },
      overallProgress: i / totalStages,
      message: messages[0],
    });

    // Progress through sub-messages
    for (let m = 0; m < messages.length; m++) {
      const subDelay = stageDuration / messages.length;
      await delay(subDelay);

      stage.progress = (m + 1) / messages.length;

      onProgress({
        stageIndex: i,
        stage: { ...stage },
        overallProgress: (i + stage.progress) / totalStages,
        message: messages[m],
        // Send correspondences during matching stage
        correspondences: stage.id === 'feature_matching' && m === messages.length - 1
          ? correspondences
          : undefined,
      });
    }

    // Mark stage as COMPLETED
    stage.status = 'COMPLETED' as StageStatus;
    stage.progress = 1;
    stage.completedAt = new Date().toISOString();

    onProgress({
      stageIndex: i,
      stage: { ...stage },
      overallProgress: (i + 1) / totalStages,
      message: `${stage.shortName} ✓`,
    });
  }

  // Build the final result
  const metrics: EvaluationMetrics = { ...DEMO_METRICS_POPULATED };
  const result: RegistrationResult = {
    jobId: `demo-job-${Date.now()}`,
    status: 'SUCCESS',
    metrics,
    correspondences,
  };

  // Final progress callback with metrics
  onProgress({
    stageIndex: totalStages - 1,
    stage: stages[totalStages - 1],
    overallProgress: 1,
    message: 'Registration complete',
    metrics,
    correspondences,
  });

  return result;
}

/* ─── Export ─── */

export interface ExportReportData {
  referenceImage: ImageMetadata;
  sourceImage: ImageMetadata;
  metrics: EvaluationMetrics;
  correspondences: Correspondence[];
  pipelineStages: string[];
  timestamp: string;
}

/**
 * Generate a client-side demo report and trigger download.
 * When the real backend is available, this will call the export API endpoint instead.
 */
export function exportReport(data: ExportReportData): void {
  const report = {
    _disclaimer: '⚠ DEMO/SIMULATED DATA — This report does not contain actual scientific results.',
    _generated: data.timestamp,
    _system: 'LunaX — Chandrayaan-2 Multimodal Registration',
    observationPair: {
      reference: {
        id: data.referenceImage.id,
        sensor: data.referenceImage.sensor,
        filename: data.referenceImage.filename,
        gsd: data.referenceImage.gsd,
        dimensions: data.referenceImage.dimensions,
        acquisition: data.referenceImage.acquisition,
        footprint: data.referenceImage.footprint,
      },
      source: {
        id: data.sourceImage.id,
        sensor: data.sourceImage.sensor,
        filename: data.sourceImage.filename,
        gsd: data.sourceImage.gsd,
        dimensions: data.sourceImage.dimensions,
        acquisition: data.sourceImage.acquisition,
        footprint: data.sourceImage.footprint,
      },
      scaleRatio: `1:${Math.round(data.sourceImage.gsd / data.referenceImage.gsd)}`,
    },
    sunGeometry: {
      reference: {
        sunElevation: data.referenceImage.acquisition.sunElevation,
        sunAzimuth: data.referenceImage.acquisition.sunAzimuth,
        incidenceAngle: data.referenceImage.acquisition.incidenceAngle,
      },
      source: {
        sunElevation: data.sourceImage.acquisition.sunElevation,
        sunAzimuth: data.sourceImage.acquisition.sunAzimuth,
        incidenceAngle: data.sourceImage.acquisition.incidenceAngle,
      },
      elevationDelta: Math.abs(
        data.referenceImage.acquisition.sunElevation - data.sourceImage.acquisition.sunElevation
      ).toFixed(1) + '°',
    },
    correspondenceStatistics: {
      totalMatches: data.metrics.totalMatches,
      totalInliers: data.metrics.totalInliers,
      inlierRatio: data.metrics.inlierRatio,
      methodBreakdown: {
        LightGlue: data.correspondences.filter((c) => c.method === 'LightGlue').length,
        RIFT2: data.correspondences.filter((c) => c.method === 'RIFT2').length,
      },
      confidenceDistribution: {
        high: data.correspondences.filter((c) => c.confidence >= 0.8).length,
        medium: data.correspondences.filter((c) => c.confidence >= 0.5 && c.confidence < 0.8).length,
        low: data.correspondences.filter((c) => c.confidence < 0.5).length,
      },
    },
    registrationMetrics: {
      rmse: data.metrics.rmse,
      uniformityScore: data.metrics.uniformityScore,
      processingTime: data.metrics.processingTime,
      gridSize: data.metrics.gridSize,
    },
    pipelineSummary: data.pipelineStages,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lunax-report-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── LunaX Mock Data ─── */
/* All data in this file is clearly DEMO DATA for frontend development. */
/* No values represent actual experimental results. */

import type {
  SensorMetadata,
  ImageMetadata,
  ProcessingStage,
  ProcessingJob,
  Correspondence,
  EvaluationMetrics,
  RegistrationResult,
} from '../types';

/* ─── Deterministic PRNG ─── */
/* Seeded pseudo-random number generator for consistent demo data across sessions. */

function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/* ─── Sensor Specifications ─── */
/* Values sourced from deep-research-report.md */

export const SENSORS: Record<string, SensorMetadata> = {
  OHRC: {
    id: 'OHRC',
    name: 'OHRC',
    fullName: 'Orbiter High-Resolution Camera',
    gsd: 0.25,
    gsdUnit: 'm/pixel',
    spectralType: 'PAN',
    description: 'Very-high-resolution panchromatic camera',
  },
  TMC2: {
    id: 'TMC2',
    name: 'TMC-2',
    fullName: 'Terrain Mapping Camera-2',
    gsd: 5,
    gsdUnit: 'm/pixel',
    spectralType: 'PAN / STEREO',
    description: 'Panchromatic stereo camera',
  },
  IIRS: {
    id: 'IIRS',
    name: 'IIRS',
    fullName: 'Imaging Infra-Red Spectrometer',
    gsd: 80,
    gsdUnit: 'm/pixel',
    spectralType: 'HYPERSPECTRAL',
    spectralRange: '800–5000 nm',
    bands: 256,
    description: 'Hyperspectral imager',
  },
};

/* ─── Demo Lunar Regions ─── */
/* DEMO DATA — these are simplified representations for frontend demonstration. */

export interface LunarRegion {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  description: string;
  availableObservations: number;
}

export const DEMO_REGIONS: LunarRegion[] = [
  {
    id: 'mare-imbrium',
    name: 'Mare Imbrium',
    lat: 32.8,
    lon: -15.6,
    elevation: -3200,
    description: 'One of the largest basaltic plains on the Moon, formed by an ancient impact.',
    availableObservations: 3,
  },
  {
    id: 'tycho-crater',
    name: 'Tycho Crater',
    lat: -43.3,
    lon: -11.2,
    elevation: 4800,
    description: 'Prominent young impact crater with distinctive ray system visible from Earth.',
    availableObservations: 2,
  },
  {
    id: 'south-pole-aitken',
    name: 'South Pole-Aitken',
    lat: -53.0,
    lon: 169.0,
    elevation: -6200,
    description: 'The largest and deepest impact basin on the Moon.',
    availableObservations: 2,
  },
  {
    id: 'aristarchus-plateau',
    name: 'Aristarchus Plateau',
    lat: 23.7,
    lon: -47.5,
    elevation: 2000,
    description: 'Geologically complex region with the brightest crater on the Moon.',
    availableObservations: 2,
  },
  {
    id: 'mare-tranquillitatis',
    name: 'Mare Tranquillitatis',
    lat: 8.5,
    lon: 31.4,
    elevation: -2800,
    description: 'Historic Apollo 11 landing region — Sea of Tranquility.',
    availableObservations: 2,
  },
];

/* ─── Demo Observations ─── */

export const DEMO_OBSERVATIONS: ImageMetadata[] = [
  {
    id: 'ohrc-mare-imbrium-001',
    sensor: 'OHRC',
    filename: 'ch2_ohrc_ncp_20200115T034512.pds4',
    dimensions: { width: 4096, height: 16384 },
    gsd: 0.25,
    footprint: {
      center: { lat: 32.8, lon: -15.6 },
      bounds: { north: 33.2, south: 32.4, east: -15.2, west: -16.0 },
      vertices: [
        { lat: 33.2, lon: -16.0 },
        { lat: 33.2, lon: -15.2 },
        { lat: 32.4, lon: -15.2 },
        { lat: 32.4, lon: -16.0 },
      ],
    },
    acquisition: {
      orbitNumber: 12847,
      acquisitionTime: '2020-01-15T03:45:12Z',
      sunElevation: 42.3,
      sunAzimuth: 178.5,
      incidenceAngle: 47.7,
      emissionAngle: 3.2,
      phaseAngle: 45.1,
      spacecraftAltitude: 100,
      viewingAngle: 2.1,
    },
  },
  {
    id: 'tmc2-mare-imbrium-001',
    sensor: 'TMC2',
    filename: 'ch2_tmc2_ncp_20200218T091034.pds4',
    dimensions: { width: 4000, height: 25000 },
    gsd: 5,
    footprint: {
      center: { lat: 33.0, lon: -15.5 },
      bounds: { north: 34.5, south: 31.5, east: -14.0, west: -17.0 },
      vertices: [
        { lat: 34.5, lon: -17.0 },
        { lat: 34.5, lon: -14.0 },
        { lat: 31.5, lon: -14.0 },
        { lat: 31.5, lon: -17.0 },
      ],
    },
    acquisition: {
      orbitNumber: 13421,
      acquisitionTime: '2020-02-18T09:10:34Z',
      sunElevation: 28.1,
      sunAzimuth: 92.4,
      incidenceAngle: 61.9,
      emissionAngle: 5.7,
      phaseAngle: 58.2,
      spacecraftAltitude: 100,
      viewingAngle: 4.8,
    },
  },
  {
    id: 'iirs-mare-imbrium-001',
    sensor: 'IIRS',
    filename: 'ch2_iirs_ncp_20200305T142256.pds4',
    dimensions: { width: 80, height: 512 },
    gsd: 80,
    footprint: {
      center: { lat: 32.5, lon: -15.8 },
      bounds: { north: 34.0, south: 31.0, east: -14.5, west: -17.1 },
      vertices: [
        { lat: 34.0, lon: -17.1 },
        { lat: 34.0, lon: -14.5 },
        { lat: 31.0, lon: -14.5 },
        { lat: 31.0, lon: -17.1 },
      ],
    },
    acquisition: {
      orbitNumber: 14102,
      acquisitionTime: '2020-03-05T14:22:56Z',
      sunElevation: 15.7,
      sunAzimuth: 245.1,
      incidenceAngle: 74.3,
      emissionAngle: 8.1,
      phaseAngle: 70.5,
      spacecraftAltitude: 100,
      viewingAngle: 6.3,
    },
  },
];

/* ─── Demo Pipeline Stages ─── */

export function createPipelineStages(status: 'idle' | 'complete'): ProcessingStage[] {
  const baseStages: Omit<ProcessingStage, 'status' | 'progress'>[] = [
    { id: 'pds4_ingestion', name: 'PDS4 Data Ingestion', shortName: 'PDS4', method: 'XML Parser' },
    { id: 'metadata_extraction', name: 'Metadata Extraction', shortName: 'METADATA', method: 'Ephemeris + Sun Params' },
    { id: 'dem_projection', name: 'DEM Projection', shortName: 'DEM', method: 'LRO-LOLA/Kaguya 59m' },
    { id: 'photometric_normalization', name: 'Photometric Normalization', shortName: 'PHOTOMETRY', method: 'CLAHE + cos(i)' },
    { id: 'feature_extraction', name: 'Feature Extraction', shortName: 'FEATURES', method: 'SuperPoint' },
    { id: 'feature_matching', name: 'Feature Matching', shortName: 'MATCHING', method: 'LightGlue + RIFT2' },
    { id: 'match_regularization', name: 'Match Regularization', shortName: 'BUCKETING', method: 'Spatial Grid 16×16' },
    { id: 'robust_fitting', name: 'Robust Geometric Fitting', shortName: 'MAGSAC++', method: 'MAGSAC++' },
    { id: 'local_warping', name: 'Local Deformation', shortName: 'TPS', method: 'Thin Plate Splines' },
    { id: 'subpixel_refinement', name: 'Sub-pixel Refinement', shortName: 'PHASE', method: 'Phase Correlation 32×32' },
    { id: 'product_generation', name: 'Product Generation', shortName: 'OUTPUT', method: 'GeoTIFF' },
  ];

  return baseStages.map((s) => ({
    ...s,
    status: status === 'complete' ? 'COMPLETED' as const : 'PENDING' as const,
    progress: status === 'complete' ? 1 : 0,
  }));
}

/* ─── Demo Correspondences (Deterministic) ─── */
/* Uses seeded PRNG so results are identical across sessions. */

export function generateDemoCorrespondences(count: number): Correspondence[] {
  const rand = createSeededRng(42);
  const correspondences: Correspondence[] = [];

  for (let i = 0; i < count; i++) {
    const isInlier = rand() > 0.15;
    const confidence = 0.4 + rand() * 0.6;
    correspondences.push({
      id: i,
      source: {
        x: 100 + rand() * 800,
        y: 100 + rand() * 600,
        confidence: 0.5 + rand() * 0.5,
      },
      reference: {
        x: 100 + rand() * 800 + (rand() - 0.5) * 20,
        y: 100 + rand() * 600 + (rand() - 0.5) * 20,
        confidence: 0.5 + rand() * 0.5,
      },
      confidence,
      isInlier,
      method: rand() > 0.3 ? 'LightGlue' : 'RIFT2',
      bucketCell: {
        row: Math.floor(rand() * 16),
        col: Math.floor(rand() * 16),
      },
    });
  }
  return correspondences;
}

/* ─── Demo Metrics (POPULATED) ─── */
/* ⚠ THESE ARE NOT REAL EXPERIMENTAL RESULTS — DEMO VALUES ONLY */

export const DEMO_METRICS_POPULATED: EvaluationMetrics = {
  rmse: 0.47,
  inlierRatio: 0.847,
  uniformityScore: 0.023,
  processingTime: 18.4,
  totalMatches: 1284,
  totalInliers: 1037,
  gridSize: { rows: 16, cols: 16 },
  cellCounts: (() => {
    const rand = createSeededRng(123);
    const grid: number[][] = [];
    for (let r = 0; r < 16; r++) {
      const row: number[] = [];
      for (let c = 0; c < 16; c++) {
        row.push(Math.floor(3 + rand() * 5));
      }
      grid.push(row);
    }
    return grid;
  })(),
};

/* ─── Legacy DEMO_METRICS (null values for backward compat) ─── */

export const DEMO_METRICS: EvaluationMetrics = {
  rmse: null,
  inlierRatio: null,
  uniformityScore: null,
  processingTime: null,
  totalMatches: null,
  totalInliers: null,
  gridSize: { rows: 16, cols: 16 },
  cellCounts: undefined,
};

/* ─── Demo Registration Result ─── */

export const DEMO_RESULT: RegistrationResult = {
  jobId: 'demo-job-001',
  status: 'SUCCESS',
  metrics: DEMO_METRICS_POPULATED,
  correspondences: generateDemoCorrespondences(1284),
};

/* ─── Demo Processing Job ─── */

export function createDemoJob(): ProcessingJob {
  return {
    id: 'demo-job-001',
    sourceImage: DEMO_OBSERVATIONS[2], // IIRS
    referenceImage: DEMO_OBSERVATIONS[0], // OHRC
    stages: createPipelineStages('idle'),
    overallProgress: 0,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
}

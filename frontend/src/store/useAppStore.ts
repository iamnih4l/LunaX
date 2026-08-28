/* ─── LunaX Application Store ─── */

import { create } from 'zustand';
import type { AppView, ImageMetadata, ProcessingJob, EvaluationMetrics, Correspondence } from '../types';

interface AppState {
  /* ─── Navigation ─── */
  currentView: AppView;
  setView: (view: AppView) => void;

  /* ─── Demo Mode ─── */
  isDemoMode: boolean;

  /* ─── Observation Selection ─── */
  referenceImage: ImageMetadata | null;
  sourceImage: ImageMetadata | null;
  setReferenceImage: (img: ImageMetadata | null) => void;
  setSourceImage: (img: ImageMetadata | null) => void;

  /* ─── Processing ─── */
  activeJob: ProcessingJob | null;
  setActiveJob: (job: ProcessingJob | null) => void;

  /* ─── Completed Results ─── */
  completedMetrics: EvaluationMetrics | null;
  completedCorrespondences: Correspondence[];
  setCompletedResults: (metrics: EvaluationMetrics, correspondences: Correspondence[]) => void;
  clearCompletedResults: () => void;

  /* ─── Processing Messages ─── */
  processingMessage: string;
  setProcessingMessage: (msg: string) => void;

  /* ─── Globe ─── */
  globeAutoRotate: boolean;
  setGlobeAutoRotate: (val: boolean) => void;

  /* ─── Sun Direction ─── */
  sunElevation: number;
  sunAzimuth: number;
  setSunElevation: (val: number) => void;
  setSunAzimuth: (val: number) => void;
  resetSunDirection: () => void;

  /* ─── Layers ─── */
  activeLayers: Set<string>;
  toggleLayer: (layerId: string) => void;
}

const DEFAULT_SUN_ELEVATION = 35;
const DEFAULT_SUN_AZIMUTH = 180;

export const useAppStore = create<AppState>((set) => ({
  currentView: 'landing',
  setView: (view) => set({ currentView: view }),

  isDemoMode: true,

  referenceImage: null,
  sourceImage: null,
  setReferenceImage: (img) => set({ referenceImage: img }),
  setSourceImage: (img) => set({ sourceImage: img }),

  activeJob: null,
  setActiveJob: (job) => set({ activeJob: job }),

  completedMetrics: null,
  completedCorrespondences: [],
  setCompletedResults: (metrics, correspondences) =>
    set({ completedMetrics: metrics, completedCorrespondences: correspondences }),
  clearCompletedResults: () =>
    set({ completedMetrics: null, completedCorrespondences: [] }),

  processingMessage: '',
  setProcessingMessage: (msg) => set({ processingMessage: msg }),

  globeAutoRotate: true,
  setGlobeAutoRotate: (val) => set({ globeAutoRotate: val }),

  sunElevation: DEFAULT_SUN_ELEVATION,
  sunAzimuth: DEFAULT_SUN_AZIMUTH,
  setSunElevation: (val) => set({ sunElevation: val }),
  setSunAzimuth: (val) => set({ sunAzimuth: val }),
  resetSunDirection: () =>
    set({ sunElevation: DEFAULT_SUN_ELEVATION, sunAzimuth: DEFAULT_SUN_AZIMUTH }),

  activeLayers: new Set(['surface', 'grid']),
  toggleLayer: (layerId) =>
    set((state) => {
      const next = new Set(state.activeLayers);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return { activeLayers: next };
    }),
}));

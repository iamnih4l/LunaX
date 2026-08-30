import { create } from 'zustand';
<<<<<<< HEAD
import type { InternalObservation } from '../core/types';
import type { ApiService } from '../core/api/apiService';
import { mockApiService } from '../core/api/mockClient';
import { realApiService } from '../core/api/realClient';
=======
import type { AppView, ImageMetadata, ProcessingJob, EvaluationMetrics, Correspondence } from '../types';
>>>>>>> 97eea63ae31c22d64b04ac68b1601be016507080

interface AppState {
  // Global Mode
  isSimulationMode: boolean;
  setSimulationMode: (val: boolean) => void;
  getApi: () => ApiService;

  // HUD
  hoverCoordinates: { lat: number, lon: number } | null;
  setHoverCoordinates: (coords: { lat: number, lon: number } | null) => void;

  // Targeting
  targetCoordinates: { lat: number, lon: number } | null;
  setTargetCoordinates: (coords: { lat: number, lon: number } | null) => void;
  manualSourceCoords: { lat: number, lon: number } | null;
  setManualSourceCoords: (coords: { lat: number, lon: number } | null) => void;

<<<<<<< HEAD
  // Navigation
  currentView: 'landing' | 'explorer' | 'correspondence' | 'result';
  setView: (view: 'landing' | 'explorer' | 'correspondence' | 'result') => void;
  
  // Selection
  referenceImage: InternalObservation | null;
  sourceImage: InternalObservation | null;
  setReferenceImage: (obs: InternalObservation | null) => void;
  setSourceImage: (obs: InternalObservation | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isSimulationMode: true, // Default to true so it works without backend
  setSimulationMode: (val) => set({ isSimulationMode: val }),
  getApi: () => get().isSimulationMode ? mockApiService : realApiService,

  hoverCoordinates: null,
  setHoverCoordinates: (coords) => set({ hoverCoordinates: coords }),

  targetCoordinates: null,
  setTargetCoordinates: (coords) => set({ targetCoordinates: coords }),
  manualSourceCoords: null,
  setManualSourceCoords: (coords) => set({ manualSourceCoords: coords }),

=======
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
>>>>>>> 97eea63ae31c22d64b04ac68b1601be016507080
  currentView: 'landing',
  setView: (view) => set({ currentView: view }),
  
  referenceImage: null,
  sourceImage: null,
<<<<<<< HEAD
  setReferenceImage: (obs) => set({ referenceImage: obs }),
  setSourceImage: (obs) => set({ sourceImage: obs }),
=======
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
>>>>>>> 97eea63ae31c22d64b04ac68b1601be016507080
}));

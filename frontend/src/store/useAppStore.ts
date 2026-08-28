/* ─── LunaX Application Store ─── */

import { create } from 'zustand';
import type { AppView, ImageMetadata, ProcessingJob } from '../types';

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

  /* ─── Globe ─── */
  globeAutoRotate: boolean;
  setGlobeAutoRotate: (val: boolean) => void;

  /* ─── Layers ─── */
  activeLayers: Set<string>;
  toggleLayer: (layerId: string) => void;
}

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

  globeAutoRotate: true,
  setGlobeAutoRotate: (val) => set({ globeAutoRotate: val }),

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

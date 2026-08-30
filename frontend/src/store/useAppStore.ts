import { create } from 'zustand';
import type { InternalObservation } from '../core/types';
import type { ApiService } from '../core/api/apiService';
import { mockApiService } from '../core/api/mockClient';
import { realApiService } from '../core/api/realClient';

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

  currentView: 'landing',
  setView: (view) => set({ currentView: view }),
  
  referenceImage: null,
  sourceImage: null,
  setReferenceImage: (obs) => set({ referenceImage: obs }),
  setSourceImage: (obs) => set({ sourceImage: obs }),
}));

/* ─── HUD Controls ─── */
/* Minimal floating overlay for telemetry and layer toggles */

import { useAppStore } from '../store/useAppStore';
import './HUD.css';

interface LayerDef {
  id: string;
  label: string;
  shortLabel: string;
}

const LAYERS: LayerDef[] = [
  { id: 'surface', label: 'Lunar Surface', shortLabel: 'SRF' },
  { id: 'grid', label: 'Coordinate Grid', shortLabel: 'GRD' },
  { id: 'ohrc', label: 'OHRC Coverage', shortLabel: 'OHRC' },
  { id: 'tmc', label: 'TMC-2 Coverage', shortLabel: 'TMC' },
  { id: 'iirs', label: 'IIRS Coverage', shortLabel: 'IIRS' },
  { id: 'sun', label: 'Sun Direction', shortLabel: 'SUN' },
  { id: 'tiepoints', label: 'Tiepoints', shortLabel: 'TIE' },
];

export default function HUD() {
  const { activeLayers, toggleLayer, isDemoMode } = useAppStore();

  return (
    <div className="hud">
      {/* Demo indicator */}
      {isDemoMode && (
        <div className="hud__demo-badge">
          <span className="hud__demo-dot" />
          DEMO DATA
        </div>
      )}

      {/* Layer controls */}
      <div className="hud__layers">
        <div className="hud__section-label">LAYERS</div>
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            className={`hud__layer-btn ${activeLayers.has(layer.id) ? 'hud__layer-btn--active' : ''}`}
            onClick={() => toggleLayer(layer.id)}
            title={layer.label}
          >
            <span className="hud__layer-indicator" />
            {layer.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

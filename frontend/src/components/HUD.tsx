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
  const {
    activeLayers, toggleLayer, isDemoMode,
    sunElevation, sunAzimuth,
    setSunElevation, setSunAzimuth, resetSunDirection,
  } = useAppStore();

  const showSunControls = activeLayers.has('sun');

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

      {/* Sun controls — visible when SUN layer is active */}
      {showSunControls && (
        <div className="hud__sun-controls">
          <div className="hud__section-label">☉ SUN DIRECTION</div>

          <div className="hud__sun-slider-group">
            <label className="hud__sun-label" htmlFor="sun-elevation">
              ELEVATION
              <span className="hud__sun-value">{sunElevation.toFixed(0)}°</span>
            </label>
            <input
              id="sun-elevation"
              type="range"
              min="5"
              max="85"
              step="1"
              value={sunElevation}
              onChange={(e) => setSunElevation(Number(e.target.value))}
              className="hud__sun-slider"
              aria-label="Sun elevation angle"
            />
          </div>

          <div className="hud__sun-slider-group">
            <label className="hud__sun-label" htmlFor="sun-azimuth">
              AZIMUTH
              <span className="hud__sun-value">{sunAzimuth.toFixed(0)}°</span>
            </label>
            <input
              id="sun-azimuth"
              type="range"
              min="0"
              max="360"
              step="1"
              value={sunAzimuth}
              onChange={(e) => setSunAzimuth(Number(e.target.value))}
              className="hud__sun-slider"
              aria-label="Sun azimuth angle"
            />
          </div>

          <button className="hud__sun-reset" onClick={resetSunDirection}>
            RESET
          </button>
        </div>
      )}
    </div>
  );
}

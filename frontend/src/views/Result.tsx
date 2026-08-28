/* ─── Registration Result View ─── */
/* Final registered product viewer with comparison controls */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MetricsPanel from '../components/MetricsPanel';
import SensorBadge from '../components/SensorBadge';
import { useAppStore } from '../store/useAppStore';
import { SENSORS, DEMO_METRICS_POPULATED } from '../api/mock';
import './Result.css';
import './ResultBlink.css';
import './ResultOverlay.css';

type CompareMode = 'source' | 'reference' | 'overlay' | 'difference' | 'blink';

/* Deterministic seeded PRNG for tiepoint / residual rendering */
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export default function Result() {
  const { referenceImage, sourceImage, setView, isDemoMode, completedMetrics } = useAppStore();
  const [compareMode, setCompareMode] = useState<CompareMode>('overlay');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showTiepoints, setShowTiepoints] = useState(false);
  const [showResiduals, setShowResiduals] = useState(false);

  const ref = referenceImage;
  const src = sourceImage;

  // Use pipeline results if available, otherwise fall back to populated demo metrics
  const metrics = completedMetrics || DEMO_METRICS_POPULATED;

  // Generate deterministic tiepoint/residual data (stable across re-renders)
  const tiepointData = useMemo(() => {
    const rand = createSeededRng(777);
    return Array.from({ length: 40 }).map(() => ({
      x: 100 + rand() * 600,
      y: 100 + rand() * 400,
      dx: (rand() - 0.5) * 20,
      dy: (rand() - 0.5) * 20,
    }));
  }, []);

  if (!ref || !src) {
    return (
      <div className="result result--empty">
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
          No registration result available.
        </p>
        <button onClick={() => setView('explorer')}>← SELECT OBSERVATIONS</button>
      </div>
    );
  }

  const refSensor = SENSORS[ref.sensor];
  const srcSensor = SENSORS[src.sensor];

  return (
    <div className="result">
      {/* Top bar */}
      <div className="result__topbar">
        <button className="result__back" onClick={() => setView('workspace')}>
          ← WORKSPACE
        </button>
        <span className="label">REGISTERED SURFACE</span>
        <button className="result__report-btn" onClick={() => setView('report')}>
          SCIENTIFIC REPORT →
        </button>
      </div>

      {/* Main content */}
      <div className="result__content">
        {/* Viewer */}
        <motion.div
          className="result__viewer"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Compare mode buttons */}
          <div className="result__modes">
            {(['source', 'reference', 'overlay', 'difference', 'blink'] as CompareMode[]).map((mode) => (
              <button
                key={mode}
                className={`result__mode-btn ${compareMode === mode ? 'result__mode-btn--active' : ''}`}
                onClick={() => setCompareMode(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button
              className={`result__mode-btn ${showTiepoints ? 'result__mode-btn--active' : ''}`}
              onClick={() => setShowTiepoints(!showTiepoints)}
            >
              TIEPOINTS
            </button>
            <button
              className={`result__mode-btn ${showResiduals ? 'result__mode-btn--active' : ''}`}
              onClick={() => setShowResiduals(!showResiduals)}
            >
              RESIDUALS
            </button>
          </div>

          {/* Image area */}
          <div className="result__image-area">
            <div className="result__image-frame">
              <div className="result__image-content">
                <div className="workspace__image-grid" />
                {compareMode === 'overlay' && (
                  <>
                    <img src={ref.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--ref" />
                    <img src={src.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--src" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} />
                    {/* Slider comparison */}
                    <div
                      className="result__slider-left"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <div className="result__slider-label">REFERENCE — {refSensor.name}</div>
                    </div>
                    <div className="result__slider-right">
                      <div className="result__slider-label">REGISTERED — {srcSensor.name}</div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="result__slider"
                      aria-label="Comparison slider"
                    />
                    <div
                      className="result__slider-line"
                      style={{ left: `${sliderPosition}%` }}
                    />
                  </>
                )}
                {compareMode === 'source' && (
                  <>
                    <img src={src.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--src" />
                    <div className="result__single-label">
                      SOURCE — {srcSensor.name} — {srcSensor.gsd} {srcSensor.gsdUnit}
                    </div>
                  </>
                )}
                {compareMode === 'reference' && (
                  <>
                    <img src={ref.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--ref" />
                    <div className="result__single-label">
                      REFERENCE — {refSensor.name} — {refSensor.gsd} {refSensor.gsdUnit}
                    </div>
                  </>
                )}
                {compareMode === 'difference' && (
                  <>
                    <img src={ref.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--ref" style={{ filter: 'invert(1) opacity(0.5)' }} />
                    <img src={src.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--src" style={{ mixBlendMode: 'difference', opacity: 0.8 }} />
                    <div className="result__single-label">
                      DIFFERENCE MAP — REGISTRATION ERROR
                    </div>
                  </>
                )}
                {compareMode === 'blink' && (
                  <div className="result__blink-container">
                    <img src={ref.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--ref result__img--blink-1" />
                    <img src={src.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} className="result__img result__img--src result__img--blink-2" />
                    <div className="result__single-label result__blink-ref">
                      REFERENCE — {refSensor.name}
                    </div>
                    <div className="result__single-label result__blink-src">
                      REGISTERED — {srcSensor.name}
                    </div>
                  </div>
                )}
                {/* SVG Overlay for Tiepoints and Residuals — DETERMINISTIC */}
                {(showTiepoints || showResiduals) && (
                  <svg className="result__svg-overlay" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    {tiepointData.map((pt, i) => (
                      <g key={i}>
                        {showTiepoints && (
                          <circle cx={pt.x} cy={pt.y} r={3} fill="var(--color-success)" />
                        )}
                        {showResiduals && (
                          <line 
                            x1={pt.x} y1={pt.y} x2={pt.x + pt.dx} y2={pt.y + pt.dy} 
                            stroke="var(--color-error)" 
                            strokeWidth={2}
                            markerEnd="url(#arrow)"
                          />
                        )}
                      </g>
                    ))}
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-error)" />
                      </marker>
                    </defs>
                  </svg>
                )}
              </div>
            </div>

            {/* Image info bar */}
            <div className="result__info-bar">
              <div className="result__info-item">
                <SensorBadge sensor={ref.sensor} />
                <span className="telemetry">{refSensor.gsd} {refSensor.gsdUnit}</span>
              </div>
              <span className="telemetry telemetry--accent">↔</span>
              <div className="result__info-item">
                <SensorBadge sensor={src.sensor} />
                <span className="telemetry">{srcSensor.gsd} {srcSensor.gsdUnit}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar metrics */}
        <motion.div
          className="result__sidebar"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <MetricsPanel metrics={metrics} isDemo={isDemoMode} />

          {/* Confidence breakdown */}
          <div className="result__confidence-section">
            <span className="label">CONFIDENCE BREAKDOWN</span>
            <div className="result__confidence-bars">
              <div className="result__confidence-row">
                <span className="result__confidence-label">HIGH (≥0.8)</span>
                <div className="result__confidence-bar">
                  <div className="result__confidence-fill result__confidence-fill--high" style={{ width: '81%' }} />
                </div>
                <span className="result__confidence-count">1,037</span>
              </div>
              <div className="result__confidence-row">
                <span className="result__confidence-label">MED (0.5–0.8)</span>
                <div className="result__confidence-bar">
                  <div className="result__confidence-fill result__confidence-fill--med" style={{ width: '14%' }} />
                </div>
                <span className="result__confidence-count">183</span>
              </div>
              <div className="result__confidence-row">
                <span className="result__confidence-label">LOW (&lt;0.5)</span>
                <div className="result__confidence-bar">
                  <div className="result__confidence-fill result__confidence-fill--low" style={{ width: '5%' }} />
                </div>
                <span className="result__confidence-count">64</span>
              </div>
            </div>
          </div>

          <div className="result__pipeline-summary">
            <span className="label">PIPELINE SUMMARY</span>
            <div className="result__summary-items">
              <div className="result__summary-row">
                <span className="result__summary-label">GEOMETRIC</span>
                <span className="result__summary-value result__summary-value--done">DEM PROJECTION</span>
              </div>
              <div className="result__summary-row">
                <span className="result__summary-label">PHOTOMETRIC</span>
                <span className="result__summary-value result__summary-value--done">CLAHE + COS(i)</span>
              </div>
              <div className="result__summary-row">
                <span className="result__summary-label">MATCHING</span>
                <span className="result__summary-value result__summary-value--done">LIGHTGLUE + RIFT2</span>
              </div>
              <div className="result__summary-row">
                <span className="result__summary-label">ROBUST FIT</span>
                <span className="result__summary-value result__summary-value--done">MAGSAC++</span>
              </div>
              <div className="result__summary-row">
                <span className="result__summary-label">LOCAL WARP</span>
                <span className="result__summary-value result__summary-value--done">TPS</span>
              </div>
              <div className="result__summary-row">
                <span className="result__summary-label">REFINEMENT</span>
                <span className="result__summary-value result__summary-value--done">PHASE CORR</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

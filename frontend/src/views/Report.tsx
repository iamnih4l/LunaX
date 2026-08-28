/* ─── Scientific Report View ─── */
/* Final report-like screen with complete pipeline summary and metrics */

import { motion } from 'framer-motion';
import MetricsPanel from '../components/MetricsPanel';
import SensorBadge from '../components/SensorBadge';
import { useAppStore } from '../store/useAppStore';
import { SENSORS, DEMO_METRICS } from '../api/mock';
import './Report.css';
import './ReportExport.css';

export default function Report() {
  const { referenceImage, sourceImage, setView, isDemoMode } = useAppStore();

  const ref = referenceImage;
  const src = sourceImage;

  if (!ref || !src) {
    return (
      <div className="report report--empty">
        <button onClick={() => setView('explorer')}>← SELECT OBSERVATIONS</button>
      </div>
    );
  }

  const refSensor = SENSORS[ref.sensor];
  const srcSensor = SENSORS[src.sensor];

  const pipelineStages = [
    { label: 'PDS4 INGESTION', method: 'XML Parser', status: 'COMPLETE' },
    { label: 'METADATA EXTRACTION', method: 'Ephemeris + Sun Params', status: 'COMPLETE' },
    { label: 'GEOMETRIC ALIGNMENT', method: 'DEM Projection (LRO-LOLA 59m)', status: 'COMPLETE' },
    { label: 'PHOTOMETRIC NORMALIZATION', method: 'CLAHE + cos(i) correction', status: 'COMPLETE' },
    { label: 'FEATURE EXTRACTION', method: 'SuperPoint', status: 'COMPLETE' },
    { label: 'FEATURE MATCHING', method: 'LightGlue + RIFT2 fallback', status: 'COMPLETE' },
    { label: 'MATCH REGULARIZATION', method: 'Spatial bucketing 16×16', status: 'COMPLETE' },
    { label: 'ROBUST FITTING', method: 'MAGSAC++', status: 'COMPLETE' },
    { label: 'LOCAL DEFORMATION', method: 'Thin Plate Splines', status: 'COMPLETE' },
    { label: 'SUB-PIXEL REFINEMENT', method: 'Phase correlation 32×32', status: 'COMPLETE' },
    { label: 'PRODUCT GENERATION', method: 'GeoTIFF', status: 'COMPLETE' },
  ];

  return (
    <div className="report">
      {/* Header */}
      <div className="report__topbar">
        <button className="report__back" onClick={() => setView('result')}>
          ← RESULTS
        </button>
        <span className="label">SCIENTIFIC REPORT</span>
        <button className="report__export" onClick={() => alert('Awaiting backend API for export generation.')}>
          EXPORT DATA ⤓
        </button>
      </div>

      <div className="report__scroll">
        <motion.div
          className="report__body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title block */}
          <div className="report__title-block">
            <h1 className="report__title">REGISTRATION ANALYSIS</h1>
            <div className="report__subtitle">
              Chandrayaan-2 Multimodal Image Correspondence
            </div>
            {isDemoMode && (
              <div className="report__demo-notice">
                ⚠ DEMO MODE — Values below are not from actual experimental processing
              </div>
            )}
          </div>

          {/* Observation pair */}
          <div className="report__section">
            <h2 className="report__section-title">OBSERVATION PAIR</h2>
            <div className="report__pair">
              <div className="report__pair-item">
                <SensorBadge sensor={ref.sensor} size="md" />
                <div className="report__pair-details">
                  <span className="report__pair-name">{refSensor.fullName}</span>
                  <span className="telemetry">{refSensor.gsd} {refSensor.gsdUnit} • {refSensor.spectralType}</span>
                  <span className="telemetry">Sun Elevation: {ref.acquisition.sunElevation.toFixed(1)}° • Incidence: {ref.acquisition.incidenceAngle.toFixed(1)}°</span>
                  <span className="telemetry">Orbit: {ref.acquisition.orbitNumber} • {ref.acquisition.acquisitionTime}</span>
                </div>
              </div>
              <div className="report__pair-separator">↔</div>
              <div className="report__pair-item">
                <SensorBadge sensor={src.sensor} size="md" />
                <div className="report__pair-details">
                  <span className="report__pair-name">{srcSensor.fullName}</span>
                  <span className="telemetry">{srcSensor.gsd} {srcSensor.gsdUnit} • {srcSensor.spectralType}</span>
                  <span className="telemetry">Sun Elevation: {src.acquisition.sunElevation.toFixed(1)}° • Incidence: {src.acquisition.incidenceAngle.toFixed(1)}°</span>
                  <span className="telemetry">Orbit: {src.acquisition.orbitNumber} • {src.acquisition.acquisitionTime}</span>
                </div>
              </div>
            </div>
            <div className="report__scale-info">
              <span className="label">SCALE RATIO</span>
              <span className="report__scale-value">1:{Math.round(srcSensor.gsd / refSensor.gsd)}</span>
            </div>
          </div>

          {/* Pipeline */}
          <div className="report__section">
            <h2 className="report__section-title">REGISTRATION PIPELINE</h2>
            <div className="report__pipeline-table">
              {pipelineStages.map((stage) => (
                <div key={stage.label} className="report__pipeline-row">
                  <span className="report__pipeline-label">{stage.label}</span>
                  <span className="report__pipeline-method">{stage.method}</span>
                  <span className="report__pipeline-status">{stage.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="report__section">
            <h2 className="report__section-title">EVALUATION METRICS</h2>
            <MetricsPanel metrics={DEMO_METRICS} isDemo={isDemoMode} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

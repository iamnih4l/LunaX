/* ─── Scientific Report View ─── */
/* Final report-like screen with complete pipeline summary and metrics */

import { useState } from 'react';
import { motion } from 'framer-motion';
import MetricsPanel from '../components/MetricsPanel';
import SensorBadge from '../components/SensorBadge';
import { useAppStore } from '../store/useAppStore';
import { SENSORS, DEMO_METRICS_POPULATED, generateDemoCorrespondences } from '../api/mock';
import { exportReport } from '../api/simulatedApi';
import './Report.css';
import './ReportExport.css';

export default function Report() {
  const { referenceImage, sourceImage, setView, isDemoMode, completedMetrics, completedCorrespondences } = useAppStore();
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'done'>('idle');

  const ref = referenceImage;
  const src = sourceImage;

  // Use pipeline results if available, fall back to populated demo
  const metrics = completedMetrics || DEMO_METRICS_POPULATED;
  const correspondences = completedCorrespondences.length > 0
    ? completedCorrespondences
    : generateDemoCorrespondences(1284);

  if (!ref || !src) {
    return (
      <div className="report report--empty">
        <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
          No report data available.
        </p>
        <button onClick={() => setView('explorer')}>← SELECT OBSERVATIONS</button>
      </div>
    );
  }

  const refSensor = SENSORS[ref.sensor];
  const srcSensor = SENSORS[src.sensor];

  const handleExport = () => {
    setExportStatus('exporting');

    // Small delay for visual feedback
    setTimeout(() => {
      exportReport({
        referenceImage: ref,
        sourceImage: src,
        metrics,
        correspondences,
        pipelineStages: [
          'PDS4 Ingestion (XML Parser)',
          'Metadata Extraction (Ephemeris + Sun Params)',
          'DEM Projection (LRO-LOLA/Kaguya 59m)',
          'Photometric Normalization (CLAHE + cos(i))',
          'Feature Extraction (SuperPoint)',
          'Feature Matching (LightGlue + RIFT2)',
          'Match Regularization (Spatial Grid 16×16)',
          'Robust Geometric Fitting (MAGSAC++)',
          'Local Deformation (Thin Plate Splines)',
          'Sub-pixel Refinement (Phase Correlation 32×32)',
          'Product Generation (GeoTIFF)',
        ],
        timestamp: new Date().toISOString(),
      });
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 3000);
    }, 500);
  };

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

  // Correspondence statistics
  const highConf = correspondences.filter((c) => c.confidence >= 0.8).length;
  const medConf = correspondences.filter((c) => c.confidence >= 0.5 && c.confidence < 0.8).length;
  const lowConf = correspondences.filter((c) => c.confidence < 0.5).length;

  return (
    <div className="report">
      {/* Header */}
      <div className="report__topbar">
        <button className="report__back" onClick={() => setView('result')}>
          ← RESULTS
        </button>
        <span className="label">SCIENTIFIC REPORT</span>
        <button
          className={`report__export ${exportStatus !== 'idle' ? 'report__export--active' : ''}`}
          onClick={handleExport}
          disabled={exportStatus === 'exporting'}
        >
          {exportStatus === 'idle' && 'EXPORT DATA ⤓'}
          {exportStatus === 'exporting' && 'GENERATING...'}
          {exportStatus === 'done' && 'DOWNLOADED ✓'}
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
                ⚠ DEMO MODE — Values below are simulated for demonstration purposes only
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

          {/* Correspondence Statistics */}
          <div className="report__section">
            <h2 className="report__section-title">CORRESPONDENCE STATISTICS</h2>
            <div className="report__stats-grid">
              <div className="report__stat-card">
                <span className="report__stat-value">{metrics.totalMatches?.toLocaleString() || '—'}</span>
                <span className="report__stat-label">TOTAL MATCHES</span>
              </div>
              <div className="report__stat-card">
                <span className="report__stat-value report__stat-value--accent">{metrics.totalInliers?.toLocaleString() || '—'}</span>
                <span className="report__stat-label">INLIERS</span>
              </div>
              <div className="report__stat-card">
                <span className="report__stat-value">{highConf.toLocaleString()}</span>
                <span className="report__stat-label">HIGH CONFIDENCE</span>
              </div>
              <div className="report__stat-card">
                <span className="report__stat-value">{medConf.toLocaleString()}</span>
                <span className="report__stat-label">MEDIUM CONFIDENCE</span>
              </div>
              <div className="report__stat-card">
                <span className="report__stat-value">{lowConf.toLocaleString()}</span>
                <span className="report__stat-label">LOW CONFIDENCE</span>
              </div>
              <div className="report__stat-card">
                <span className="report__stat-value">{metrics.inlierRatio !== null ? (metrics.inlierRatio * 100).toFixed(1) + '%' : '—'}</span>
                <span className="report__stat-label">INLIER RATIO</span>
              </div>
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
            <MetricsPanel metrics={metrics} isDemo={isDemoMode} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

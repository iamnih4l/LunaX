/* ─── Registration Workspace View ─── */
/* The heart — cinematic pipeline progression with side-by-side images */

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ProcessingPipeline from '../components/ProcessingPipeline';
import MetricsPanel from '../components/MetricsPanel';
import SensorBadge from '../components/SensorBadge';
import CorrespondenceViewer from '../components/CorrespondenceViewer';
import { useAppStore } from '../store/useAppStore';
import { createPipelineStages, SENSORS, DEMO_METRICS_POPULATED } from '../api/mock';
import { runCorrespondence } from '../api/simulatedApi';
import type { ProcessingStage, Correspondence } from '../types';
import './Workspace.css';

export default function Workspace() {
  const { referenceImage, sourceImage, setView, isDemoMode, setCompletedResults, processingMessage, setProcessingMessage } = useAppStore();
  const [stages, setStages] = useState<ProcessingStage[]>(createPipelineStages('idle'));
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const cancelRef = useRef(false);

  const ref = referenceImage;
  const src = sourceImage;

  /* Run pipeline via simulated API (demo mode) or real backend */
  const runPipeline = useCallback(async () => {
    if (isProcessing || !ref || !src) return;
    setIsProcessing(true);
    setCurrentStageIdx(0);
    setStages(createPipelineStages('idle'));
    setCorrespondences([]);
    setIsComplete(false);
    setOverallProgress(0);
    setProcessingMessage('Initializing pipeline...');
    cancelRef.current = false;

    try {
      const result = await runCorrespondence(ref, src, (update) => {
        if (cancelRef.current) return;

        // Update the current stage
        setCurrentStageIdx(update.stageIndex);
        setOverallProgress(update.overallProgress);
        setProcessingMessage(update.message);

        // Update the stages array
        setStages((prev) =>
          prev.map((s, i) => {
            if (i < update.stageIndex) {
              return { ...s, status: 'COMPLETED', progress: 1 };
            }
            if (i === update.stageIndex) {
              return { ...update.stage };
            }
            return s;
          })
        );

        // Receive correspondences when they arrive
        if (update.correspondences) {
          setCorrespondences(update.correspondences);
        }
      });

      if (!cancelRef.current) {
        setIsProcessing(false);
        setIsComplete(true);
        setStages((prev) => prev.map((s) => ({ ...s, status: 'COMPLETED' as const, progress: 1 })));
        setProcessingMessage('Registration complete ✓');
        setCompletedResults(result.metrics, result.correspondences);
      }
    } catch (e) {
      console.error('Pipeline error:', e);
      setIsProcessing(false);
      setProcessingMessage('Pipeline error — retry available');
    }
  }, [isProcessing, ref, src, setCompletedResults, setProcessingMessage]);

  if (!ref || !src) {
    return (
      <div className="workspace workspace--empty">
        <p>No observation pair selected.</p>
        <button onClick={() => setView('explorer')}>← SELECT OBSERVATIONS</button>
      </div>
    );
  }

  const refSensor = SENSORS[ref.sensor];
  const srcSensor = SENSORS[src.sensor];

  return (
    <div className="workspace">
      {/* Top bar */}
      <div className="workspace__topbar">
        <button className="workspace__back" onClick={() => setView('explorer')}>
          ← OBSERVATIONS
        </button>
        <div className="workspace__title">
          <span className="label">REGISTRATION WORKSPACE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isDemoMode && (
            <span className="workspace__demo-tag">DEMO DATA</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(isProcessing || isComplete) && (
        <div className="workspace__progress-bar">
          <motion.div
            className="workspace__progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="workspace__content">
        {/* Left — Pipeline */}
        <motion.div
          className="workspace__pipeline"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <ProcessingPipeline
            stages={stages}
            currentStageId={currentStageIdx >= 0 && currentStageIdx < stages.length ? stages[currentStageIdx].id : undefined}
          />

          {/* Status message */}
          {processingMessage && (isProcessing || isComplete) && (
            <div className="workspace__status-msg">
              <span className="telemetry">{processingMessage}</span>
            </div>
          )}

          {/* Run button */}
          {!isProcessing && !isComplete && (
            <button className="workspace__run" onClick={runPipeline}>
              ▶ BEGIN REGISTRATION
            </button>
          )}
          {isComplete && (
            <button className="workspace__results" onClick={() => setView('result')}>
              VIEW RESULTS →
            </button>
          )}
        </motion.div>

        {/* Center — Image Comparison */}
        <motion.div
          className="workspace__images"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {isProcessing || isComplete ? (
            <CorrespondenceViewer 
              referenceImage={ref} 
              sourceImage={src}
              stageId={isComplete ? stages[stages.length - 1].id : (currentStageIdx >= 0 && currentStageIdx < stages.length ? stages[currentStageIdx].id : undefined)}
              correspondences={correspondences}
            />
          ) : (
            <div className="workspace__images-placeholder" style={{ display: 'flex', gap: '2rem', width: '100%', flex: 1 }}>
              {/* Reference */}
              <div className="workspace__image-panel" style={{ flex: 1 }}>
                <div className="workspace__image-header">
                  <SensorBadge sensor={ref.sensor} size="md" />
                  <span className="workspace__image-label">REFERENCE</span>
                </div>
                <div className="workspace__image-frame">
                  <div className="workspace__image-placeholder" style={{ position: 'relative' }}>
                    <img 
                      src={ref.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                      alt="Reference" 
                    />
                    <span className="workspace__image-text" style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px' }}>{refSensor.name}</span>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div className="workspace__image-panel" style={{ flex: 1 }}>
                <div className="workspace__image-header">
                  <SensorBadge sensor={src.sensor} size="md" />
                  <span className="workspace__image-label">SOURCE</span>
                </div>
                <div className="workspace__image-frame">
                  <div className="workspace__image-placeholder" style={{ position: 'relative' }}>
                    <img 
                      src={src.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                      alt="Source" 
                    />
                    <span className="workspace__image-text" style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px' }}>{srcSensor.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right — Telemetry */}
        <motion.div
          className="workspace__telemetry"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="workspace__pair-info">
            <span className="label">OBSERVATION PAIR</span>
            <div className="workspace__pair-detail">
              <span className="workspace__pair-sensor">{refSensor.name}</span>
              <span className="workspace__pair-arrow">↔</span>
              <span className="workspace__pair-sensor">{srcSensor.name}</span>
            </div>
            <div className="workspace__pair-scale">
              <span className="label">SCALE RATIO</span>
              <span className="workspace__pair-ratio">
                1:{Math.round(srcSensor.gsd / refSensor.gsd)}
              </span>
            </div>
          </div>

          {/* Geometry info */}
          <div className="workspace__pair-info">
            <span className="label">SUN GEOMETRY</span>
            <div className="workspace__geometry-grid">
              <div className="workspace__geometry-item">
                <span className="workspace__geometry-label">REF ☉ ELEV</span>
                <span className="workspace__geometry-value">{ref.acquisition.sunElevation.toFixed(1)}°</span>
              </div>
              <div className="workspace__geometry-item">
                <span className="workspace__geometry-label">SRC ☉ ELEV</span>
                <span className="workspace__geometry-value">{src.acquisition.sunElevation.toFixed(1)}°</span>
              </div>
              <div className="workspace__geometry-item">
                <span className="workspace__geometry-label">Δ ELEVATION</span>
                <span className="workspace__geometry-value" style={{ color: 'var(--color-accent)' }}>
                  {Math.abs(ref.acquisition.sunElevation - src.acquisition.sunElevation).toFixed(1)}°
                </span>
              </div>
            </div>
          </div>

          {isComplete && (
            <MetricsPanel metrics={DEMO_METRICS_POPULATED} isDemo={isDemoMode} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

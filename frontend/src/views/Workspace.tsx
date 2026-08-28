/* ─── Registration Workspace View ─── */
/* The heart — cinematic pipeline progression with side-by-side images */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProcessingPipeline from '../components/ProcessingPipeline';
import MetricsPanel from '../components/MetricsPanel';
import SensorBadge from '../components/SensorBadge';
import CorrespondenceViewer from '../components/CorrespondenceViewer';
import { useAppStore } from '../store/useAppStore';
import { createPipelineStages, SENSORS, DEMO_METRICS, generateDemoCorrespondences } from '../api/mock';
import { startRegistration, connectJobWebSocket } from '../api/client';
import type { ProcessingStage, StageStatus, Correspondence } from '../types';
import './Workspace.css';

export default function Workspace() {
  const { referenceImage, sourceImage, setView, isDemoMode } = useAppStore();
  const [stages, setStages] = useState<ProcessingStage[]>(createPipelineStages('idle'));
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);

  const ref = referenceImage;
  const src = sourceImage;

  /* Run pipeline via backend API */
  const runPipeline = useCallback(async () => {
    if (isProcessing || !ref || !src) return;
    setIsProcessing(true);
    setCurrentStageIdx(0);
    setStages(createPipelineStages('idle'));
    // Use demo correspondences for visualizer until backend sends them
    setCorrespondences(generateDemoCorrespondences(300));
    setIsComplete(false);

    try {
      const response = await startRegistration(src, ref);
      
      const ws = connectJobWebSocket(response.job_id, (data) => {
        if (data.status === 'completed') {
          setIsProcessing(false);
          setIsComplete(true);
          setStages((prev) => prev.map(s => ({ ...s, status: 'COMPLETED', progress: 1 })));
          setCurrentStageIdx(11);
          ws.close();
        } else if (data.status === 'failed') {
          console.error('Job failed:', data.message);
          setIsProcessing(false);
          ws.close();
        } else if (data.status === 'processing') {
          // Map backend stage name to frontend index array
          let targetIdx = 0;
          const stageStr = (data.stage || '').toUpperCase();
          if (stageStr === 'INGEST') targetIdx = 1;
          else if (stageStr === 'PREPROCESS') targetIdx = 3;
          else if (stageStr === 'FEATURES') targetIdx = 5;
          else if (stageStr === 'GEOMETRY') targetIdx = 7;
          else if (stageStr === 'REGISTER') targetIdx = 9;
          else if (stageStr === 'EVALUATE') targetIdx = 10;
          
          setCurrentStageIdx(targetIdx);
          setStages(prev => prev.map((s, i) => {
            if (i < targetIdx) return { ...s, status: 'COMPLETED', progress: 1 };
            if (i === targetIdx) return { ...s, status: 'RUNNING', progress: data.progress || 0.5 };
            return { ...s, status: 'PENDING', progress: 0 };
          }));
        }
      });
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  }, [isProcessing, ref, src]);

  // Remove the old useEffect that simulated the timeout.

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
        {isDemoMode && (
          <span className="workspace__demo-tag">DEMO DATA</span>
        )}
      </div>

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

          {isComplete && (
            <MetricsPanel metrics={DEMO_METRICS} isDemo={isDemoMode} />
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CircleDashed, Terminal } from 'lucide-react';
import './ProcessingView.css';

interface ProcessingViewProps {
  reference: string | null;
  source: string | null;
  onComplete: () => void;
}

const STAGES = [
  'PDS4 Ingestion',
  'Metadata Extraction',
  'DEM Projection',
  'Photometric Normalization',
  'Feature Extraction',
  'Feature Matching',
  'Match Regularization',
  'Robust Geometric Fitting',
  'Local Deformation',
  'Sub-pixel Refinement',
  'Product Generation'
];

export default function ProcessingView({ reference, source, onComplete }: ProcessingViewProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [logs, setLogs] = useState<string[]>(['Initializing registration pipeline...']);

  useEffect(() => {
    let isMounted = true;
    
    const runPipeline = async () => {
      for (let i = 0; i < STAGES.length; i++) {
        if (!isMounted) return;
        
        setCurrentStage(i);
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] Started: ${STAGES[i]}`]);
        
        // Simulate processing time (faster for demo: 800ms to 1500ms)
        const delay = 800 + Math.random() * 700;
        await new Promise(r => setTimeout(r, delay));
        
        if (!isMounted) return;
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] Completed: ${STAGES[i]} ✓`]);
      }
      
      if (!isMounted) return;
      setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,-1)}] REGISTRATION SUCCESSFUL`]);
      
      // Wait a moment before moving to results
      await new Promise(r => setTimeout(r, 1000));
      if (isMounted) onComplete();
    };

    runPipeline();

    return () => { isMounted = false; };
  }, [onComplete]);

  return (
    <div className="processing-view">
      <div className="processing-container glass-panel">
        <div className="processing-header">
          <h2 className="section-title text-gradient">Registration Pipeline</h2>
          <div className="mono-label">PAIR: {reference} → {source}</div>
        </div>

        <div className="pipeline-layout">
          {/* Left: Stages List */}
          <div className="stages-list">
            {STAGES.map((stage, idx) => {
              const status = idx < currentStage ? 'completed' : idx === currentStage ? 'running' : 'pending';
              return (
                <motion.div 
                  key={stage} 
                  className={`stage-item ${status}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="stage-icon">
                    {status === 'completed' && <CheckCircle size={18} className="text-success" />}
                    {status === 'running' && <CircleDashed size={18} className="spin text-accent" />}
                    {status === 'pending' && <div className="dot-pending" />}
                  </div>
                  <span className="stage-name mono-label">{stage}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Terminal Logs */}
          <div className="terminal-container">
            <div className="terminal-header">
              <Terminal size={14} /> <span className="mono-label">SYSTEM_LOG</span>
            </div>
            <div className="terminal-body">
              {logs.map((log, idx) => (
                <div key={idx} className="log-line mono-label">
                  {log}
                </div>
              ))}
              {currentStage < STAGES.length && (
                <div className="log-line mono-label blink">_</div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-track">
          <motion.div 
            className="progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStage) / STAGES.length) * 100}%` }}
            transition={{ ease: "linear", duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}

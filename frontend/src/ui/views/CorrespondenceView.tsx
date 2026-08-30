import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { InternalJobStatus } from '../../core/types';

export default function CorrespondenceView() {
  const { getApi, referenceImage, sourceImage, setView } = useAppStore();
  
  // State Machine handling
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'STARTING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<InternalJobStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Clean up websocket on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleStart = async () => {
    if (!referenceImage || !sourceImage) return;
    
    try {
      const api = getApi();
      setPipelineState('STARTING');
      setErrorMessage('');
      
      const { jobId } = await api.registerPair(sourceImage, referenceImage, {
        featureMethod: 'auto',
        photometricModel: 'lommel_seeliger',
        gridSize: 32
      });
      
      setJobId(jobId);
      setPipelineState('PROCESSING');
      
      // Connect WebSocket
      const unsubscribe = api.subscribeToJob(jobId, (status: InternalJobStatus) => {
        setJobStatus(status);
        if (status.status === 'COMPLETED') {
          setPipelineState('COMPLETED');
        } else if (status.status === 'FAILED') {
          setPipelineState('ERROR');
          setErrorMessage(status.message || 'Pipeline failed during execution.');
        }
      });
      
      unsubscribeRef.current = unsubscribe;
      
    } catch (err: any) {
      setPipelineState('ERROR');
      setErrorMessage(err.message || 'Failed to initiate registration.');
    }
  };

  const cancelPipeline = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    setPipelineState('IDLE');
    setJobId(null);
    setJobStatus(null);
  };

  // Safe fallback if navigated here directly without images
  if (!referenceImage || !sourceImage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <h2 className="label">NO IMAGES SELECTED</h2>
        <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setView('explorer')}>RETURN TO EXPLORER</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="label" onClick={() => setView('explorer')}>← BACK TO EXPLORER</button>
        <div className="label">CORRESPONDENCE WORKSPACE</div>
        <div className="label" style={{ opacity: 0.5 }}>{jobId || 'READY'}</div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Images Panel */}
        <div className="panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', border: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
              <div className="label" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px' }}>
                REFERENCE: {referenceImage.sensor}
              </div>
              <img 
                src={referenceImage.sensor === 'CUSTOM' ? referenceImage.previewUrl : ((useAppStore.getState().targetCoordinates || useAppStore.getState().manualSourceCoords) ? '/craters/crater_ref.jpg' : referenceImage.previewUrl)} 
                alt="Reference" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.8
                }} 
              />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', border: 'var(--border-subtle)', borderRadius: 'var(--radius-sm)', position: 'relative', overflow: 'hidden' }}>
              <div className="label" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '4px 8px' }}>
                SOURCE: {sourceImage.sensor}
              </div>
              <img 
                src={(useAppStore.getState().targetCoordinates || useAppStore.getState().manualSourceCoords) ? '/craters/crater_src.jpg' : sourceImage.previewUrl} 
                alt="Source" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.8
                }} 
              />
            </div>
            
          </div>
        </div>

        {/* Telemetry / Control Panel */}
        <div className="panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="label label--accent">PIPELINE CONTROL</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pipelineState === 'IDLE' && (
                <button className="btn-primary" onClick={handleStart}>BEGIN REGISTRATION</button>
              )}
              {pipelineState === 'STARTING' && (
                <button className="btn-primary" disabled>INITIALIZING...</button>
              )}
              {pipelineState === 'PROCESSING' && (
                <button className="btn-primary" onClick={cancelPipeline} style={{ borderColor: 'var(--color-accent-red)', color: 'var(--color-accent-red)' }}>CANCEL PROCESSING</button>
              )}
              {pipelineState === 'COMPLETED' && (
                <button className="btn-primary" onClick={() => setView('result')} style={{ borderColor: 'var(--color-accent-green)', color: 'var(--color-accent-green)' }}>VIEW RESULTS</button>
              )}
              {pipelineState === 'ERROR' && (
                <button className="btn-primary" onClick={handleStart}>RETRY REGISTRATION</button>
              )}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 className="label" style={{ marginBottom: '1rem' }}>TELEMETRY</h3>
            
            {/* Status Visualizer */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', border: 'var(--border-subtle)' }}>
              
              {pipelineState === 'ERROR' ? (
                <div style={{ color: 'var(--color-accent-red)' }}>
                  <div className="text-mono font-bold">SYSTEM FAILURE</div>
                  <div className="text-sm" style={{ marginTop: '0.5rem' }}>{errorMessage}</div>
                </div>
              ) : pipelineState === 'IDLE' ? (
                <div className="text-mono text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>AWAITING COMMAND</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-mono text-sm" style={{ color: 'var(--color-accent-blue)' }}>{jobStatus?.stageName || 'INITIALIZING'}</span>
                    <span className="text-mono text-sm">{jobStatus?.progress || 0}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${jobStatus?.progress || 0}%`, background: 'var(--color-accent-blue)', transition: 'width 0.3s ease' }} />
                  </div>
                  
                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {jobStatus?.message || 'Processing...'}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

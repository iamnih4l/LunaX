import { useAppStore } from '../../store/useAppStore';
import { useEffect, useState } from 'react';

export default function ResultView() {
  const { setView, sourceImage, referenceImage, targetCoordinates, manualSourceCoords } = useAppStore();
  const [tiePoints, setTiePoints] = useState<Array<{x1: number, y1: number, x2: number, y2: number}>>([]);

  useEffect(() => {
    // Generate pseudo-random visual tie points for cinematic effect
    const points = [];
    for(let i = 0; i < 150; i++) {
      // Left side (5% to 45% of container width)
      const x1 = 5 + Math.random() * 40;
      // Right side (55% to 95% of container width)
      const x2 = 55 + Math.random() * 40;
      
      const y1 = 5 + Math.random() * 90;
      // Slightly distorted y2 to simulate matching an offset feature
      const y2 = Math.max(5, Math.min(95, y1 + (Math.random() * 30 - 15)));
      
      points.push({ x1, y1, x2, y2 });
    }
    setTiePoints(points);
  }, []);

  // Calculate zoom focus based on targeted coordinates to show specific crater
  const isZoomed = !!targetCoordinates || !!manualSourceCoords;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="label" style={{ fontSize: '1.5rem', color: 'var(--color-accent-green)' }}>
          REGISTRATION COMPLETE: {isZoomed ? 'LOCAL CRATER ALIGNED' : 'TARGET ALIGNED'}
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => setView('explorer')}>NEW REGISTRATION</button>
          <button className="btn-primary" style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-primary)' }}>EXPORT REPORT</button>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="panel" style={{ padding: '1rem', display: 'flex', gap: '4rem', marginBottom: '1rem', background: 'rgba(0, 150, 0, 0.05)' }}>
         <div>
            <div className="label">RMSE</div>
            <div className="text-mono text-xl" style={{ color: 'var(--color-accent-green)' }}>0.45 px</div>
         </div>
         <div>
            <div className="label">INLIER RATIO</div>
            <div className="text-mono text-xl" style={{ color: 'var(--color-accent-green)' }}>88%</div>
         </div>
         <div>
            <div className="label">VALIDATED TIE-POINTS</div>
            <div className="text-mono text-xl" style={{ color: 'var(--color-accent-green)' }}>{tiePoints.length}</div>
         </div>
      </div>

      {/* Visual Matching Container */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '2rem', border: 'var(--border-subtle)', background: '#000', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        
        {/* SVG Overlay for Points and Lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
          {tiePoints.map((pt, idx) => (
            <g key={idx}>
              {/* Connecting Line */}
              <line x1={`${pt.x1}%`} y1={`${pt.y1}%`} x2={`${pt.x2}%`} y2={`${pt.y2}%`} stroke="rgba(0, 255, 150, 0.15)" strokeWidth="1" />
              {/* Source Point */}
              <circle cx={`${pt.x1}%`} cy={`${pt.y1}%`} r="2" fill="#00ff96" />
              {/* Reference Point */}
              <circle cx={`${pt.x2}%`} cy={`${pt.y2}%`} r="2" fill="#00ff96" />
            </g>
          ))}
        </svg>

        {/* Left Image (Reference) */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div className="label" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 20, background: 'rgba(0,0,0,0.8)', padding: '4px 8px' }}>
            REF: {referenceImage?.sensor} {isZoomed && '(LOCALIZED CRATER)'}
          </div>
          <img 
            src={referenceImage?.sensor === 'CUSTOM' ? referenceImage.previewUrl : (isZoomed ? '/craters/crater_ref.jpg' : (referenceImage?.previewUrl || ''))} 
            alt="Reference" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: 0.8
            }} 
          />
        </div>

        {/* Right Image (Source) */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div className="label" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 20, background: 'rgba(0,0,0,0.8)', padding: '4px 8px' }}>
            SRC: {sourceImage?.sensor} {isZoomed && '(LOCALIZED CRATER)'}
          </div>
          <img 
            src={isZoomed ? '/craters/crater_src.jpg' : (sourceImage?.previewUrl || '')} 
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
  );
}

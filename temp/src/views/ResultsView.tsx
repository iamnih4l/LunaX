import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, SlidersHorizontal } from 'lucide-react';
import './ResultsView.css';

interface ResultsViewProps {
  onBack: () => void;
}

export default function ResultsView({ onBack }: ResultsViewProps) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <motion.div 
      className="results-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="top-bar glass-panel">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> NEW REGISTRATION
        </button>
        <div className="mono-label">SCIENTIFIC REPORT</div>
        <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
          <Download size={16} /> EXPORT
        </button>
      </div>

      <div className="results-content">
        {/* Left: Image Comparison */}
        <div className="comparison-container glass-panel">
          <div className="comparison-header">
            <SlidersHorizontal size={18} /> <span className="mono-label">OVERLAY COMPARISON</span>
          </div>
          
          <div className="slider-area">
            {/* Mock Moon Images - using robust external URLs or generic gradients for the demo if images aren't available */}
            <div className="img-layer ref-layer">
              <div className="img-placeholder" style={{ background: 'url(https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg) center/cover' }} />
              <div className="layer-label mono-label">OHRC (REFERENCE)</div>
            </div>
            
            <div 
              className="img-layer src-layer"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <div className="img-placeholder" style={{ background: 'url(https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg) center/cover', filter: 'hue-rotate(180deg)' }} />
              <div className="layer-label src-label mono-label">TMC-2 (REGISTERED)</div>
            </div>

            <input 
              type="range" 
              min="0" max="100" 
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="compare-slider"
            />
            <div className="slider-line" style={{ left: `${sliderPos}%` }} />
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="metrics-container glass-panel">
          <h2 className="section-title text-gradient" style={{ marginBottom: '2rem' }}>Evaluation Metrics</h2>
          
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-val">0.47<span className="metric-unit">m</span></div>
              <div className="mono-label">RMSE</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">84.7<span className="metric-unit">%</span></div>
              <div className="mono-label">INLIER RATIO</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">1,284</div>
              <div className="mono-label">TOTAL MATCHES</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">1,037</div>
              <div className="mono-label">INLIERS</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">0.023</div>
              <div className="mono-label">UNIFORMITY SCORE</div>
            </div>
            <div className="metric-box">
              <div className="metric-val">18.4<span className="metric-unit">s</span></div>
              <div className="mono-label">PROCESSING TIME</div>
            </div>
          </div>

          <div className="confidence-breakdown">
             <div className="mono-label" style={{ marginBottom: '1rem' }}>CONFIDENCE BREAKDOWN</div>
             
             <div className="conf-row">
               <span className="mono-label" style={{ width: '60px' }}>HIGH</span>
               <div className="conf-bar-bg"><div className="conf-bar-fill" style={{ width: '81%', background: 'var(--color-success)' }}/></div>
               <span className="mono-label">1,037</span>
             </div>
             <div className="conf-row">
               <span className="mono-label" style={{ width: '60px' }}>MED</span>
               <div className="conf-bar-bg"><div className="conf-bar-fill" style={{ width: '14%', background: 'var(--color-accent-amber)' }}/></div>
               <span className="mono-label">183</span>
             </div>
             <div className="conf-row">
               <span className="mono-label" style={{ width: '60px' }}>LOW</span>
               <div className="conf-bar-bg"><div className="conf-bar-fill" style={{ width: '5%', background: 'var(--color-error)' }}/></div>
               <span className="mono-label">64</span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

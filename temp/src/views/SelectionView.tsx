import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import './SelectionView.css';

interface SelectionViewProps {
  onBack: () => void;
  onProceed: (refId: string, srcId: string) => void;
}

const MOCK_OBSERVATIONS = [
  { id: 'ohrc-01', sensor: 'OHRC', gsd: '0.25m', region: 'Mare Imbrium', type: 'Reference' },
  { id: 'tmc-01', sensor: 'TMC-2', gsd: '5.0m', region: 'Mare Imbrium', type: 'Source' },
  { id: 'iirs-01', sensor: 'IIRS', gsd: '80.0m', region: 'Mare Imbrium', type: 'Source' },
];

export default function SelectionView({ onBack, onProceed }: SelectionViewProps) {
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

  const handleProceed = () => {
    if (selectedRef && selectedSrc) {
      onProceed(selectedRef, selectedSrc);
    }
  };

  return (
    <motion.div 
      className="selection-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="top-bar glass-panel">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> BACK
        </button>
        <div className="mono-label">OBSERVATION SELECTION</div>
        <div style={{ width: 80 }} /> {/* Spacer */}
      </div>

      <div className="selection-content">
        <div className="selection-section">
          <h2 className="section-title"><span className="text-gradient">1. Reference Image</span></h2>
          <div className="card-grid">
            {MOCK_OBSERVATIONS.filter(o => o.type === 'Reference').map(obs => (
              <motion.div 
                key={obs.id}
                className={`obs-card glass-panel ${selectedRef === obs.id ? 'selected' : ''}`}
                onClick={() => setSelectedRef(obs.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="obs-header">
                  <span className="mono-label sensor-badge">{obs.sensor}</span>
                  {selectedRef === obs.id && <Check className="check-icon" size={16} />}
                </div>
                <div className="obs-body">
                  <div className="obs-region">{obs.region}</div>
                  <div className="mono-label">GSD: {obs.gsd}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="selection-section">
          <h2 className="section-title"><span className="text-gradient">2. Source Image</span></h2>
          <div className="card-grid">
            {MOCK_OBSERVATIONS.filter(o => o.type === 'Source').map(obs => (
              <motion.div 
                key={obs.id}
                className={`obs-card glass-panel ${selectedSrc === obs.id ? 'selected' : ''}`}
                onClick={() => setSelectedSrc(obs.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="obs-header">
                  <span className="mono-label sensor-badge">{obs.sensor}</span>
                  {selectedSrc === obs.id && <Check className="check-icon" size={16} />}
                </div>
                <div className="obs-body">
                  <div className="obs-region">{obs.region}</div>
                  <div className="mono-label">GSD: {obs.gsd}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom-bar glass-panel">
        <div className="selection-status mono-label">
          {selectedRef && selectedSrc 
            ? `READY: ${selectedRef} → ${selectedSrc}` 
            : 'AWAITING SELECTION...'}
        </div>
        <button 
          className="btn-primary proceed-btn"
          disabled={!selectedRef || !selectedSrc}
          onClick={handleProceed}
        >
          INITIATE REGISTRATION <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}

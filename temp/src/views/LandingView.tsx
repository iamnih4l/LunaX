import { motion } from 'framer-motion';
import { ChevronRight, Database, Maximize, Orbit } from 'lucide-react';
import './LandingView.css';

interface LandingViewProps {
  onStart: () => void;
}

export default function LandingView({ onStart }: LandingViewProps) {
  return (
    <div className="landing-view">
      <div className="landing-content">
        <motion.div 
          className="brand-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mono-label" style={{ color: 'var(--color-accent-amber)' }}>ISRO LUNAR PROGRAM</span>
        </motion.div>
        
        <motion.h1 
          className="title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-gradient">LunaX</span>
        </motion.h1>
        
        <motion.h2 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Chandrayaan-2 Multimodal Registration
        </motion.h2>

        <motion.div 
          className="features glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="feature-item">
            <Orbit className="feature-icon" />
            <div className="feature-text">
              <div className="mono-label">OHRC • TMC-2 • IIRS</div>
              <div className="feature-desc">Cross-sensor alignment</div>
            </div>
          </div>
          <div className="feature-item">
            <Maximize className="feature-icon" />
            <div className="feature-text">
              <div className="mono-label">Sub-pixel</div>
              <div className="feature-desc">Extreme scale variance</div>
            </div>
          </div>
          <div className="feature-item">
            <Database className="feature-icon" />
            <div className="feature-text">
              <div className="mono-label">PDS4 Ready</div>
              <div className="feature-desc">Direct archive ingestion</div>
            </div>
          </div>
        </motion.div>

        <motion.button 
          className="btn-primary start-btn"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          INITIATE MISSION <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}

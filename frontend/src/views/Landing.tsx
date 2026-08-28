/* ─── Landing View ─── */
/* Immersive entry experience — full-screen rotating Moon with cinematic typography */

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import LunarGlobe from '../components/LunarGlobe';
import StarField from '../components/StarField';
import { useAppStore } from '../store/useAppStore';
import './Landing.css';

export default function Landing() {
  const setView = useAppStore((s) => s.setView);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExplore = () => {
    setView('explorer');
  };

  return (
    <div className="landing" ref={containerRef}>
      {/* 3D Scene */}
      <div className="landing__canvas">
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <StarField count={2500} radius={60} />
          <LunarGlobe radius={1.8} interactive={false} />
        </Canvas>
      </div>

      {/* Overlay Content */}
      <div className="landing__overlay">
        {/* Top telemetry bar */}
        <motion.div
          className="landing__telemetry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          <span className="telemetry">CHANDRAYAAN-2 ORBITER</span>
          <span className="telemetry">ISRO • SIH 2026</span>
        </motion.div>

        {/* Central content */}
        <div className="landing__center">
          <motion.div
            className="landing__subtitle-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            MULTIMODAL IMAGE REGISTRATION
          </motion.div>

          <motion.h1
            className="landing__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            LunaX
          </motion.h1>

          <motion.div
            className="landing__invariance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <span>SUN-ANGLE</span>
            <span className="landing__dot" />
            <span>SCALE</span>
            <span className="landing__dot" />
            <span>SPECTRAL INVARIANCE</span>
          </motion.div>

          <motion.div
            className="landing__sensors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
          >
            <div className="landing__sensor">
              <span className="landing__sensor-name">OHRC</span>
              <span className="landing__sensor-spec">0.25 m/px</span>
            </div>
            <div className="landing__sensor-divider" />
            <div className="landing__sensor">
              <span className="landing__sensor-name">TMC-2</span>
              <span className="landing__sensor-spec">5 m/px</span>
            </div>
            <div className="landing__sensor-divider" />
            <div className="landing__sensor">
              <span className="landing__sensor-name">IIRS</span>
              <span className="landing__sensor-spec">80 m/px</span>
            </div>
          </motion.div>

          <motion.button
            className="landing__cta"
            onClick={handleExplore}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            EXPLORE LUNAR DATA
          </motion.button>
        </div>

        {/* Bottom coordinates */}
        <motion.div
          className="landing__bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
        >
          <span className="telemetry">OHRC 0.25m • TMC-2 5m • IIRS 80m</span>
          <span className="telemetry">PDS4 • DEM • LIGHTGLUE • RIFT2 • MAGSAC++ • TPS</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Lunar Explorer View ─── */
/* Primary Moon interface with sensor footprints and observation selection */

import { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import LunarGlobe from '../components/LunarGlobe';
import StarField from '../components/StarField';
import HUD from '../components/HUD';
import ObservationCard from '../components/ObservationCard';
import { useAppStore } from '../store/useAppStore';
import { DEMO_OBSERVATIONS, SENSORS } from '../api/mock';
import type { ImageMetadata } from '../types';
import ImageUploader from '../components/ImageUploader';
import './Explorer.css';

export default function Explorer() {
  const { setView, setReferenceImage, setSourceImage, sunElevation, sunAzimuth } = useAppStore();

  // Compute sun direction vector from elevation/azimuth
  const sunDirection = useMemo((): [number, number, number] => {
    const elRad = (sunElevation * Math.PI) / 180;
    const azRad = (sunAzimuth * Math.PI) / 180;
    return [
      Math.cos(elRad) * Math.cos(azRad) * 5,
      Math.sin(elRad) * 2,
      Math.cos(elRad) * Math.sin(azRad) * 3,
    ];
  }, [sunElevation, sunAzimuth]);
  const [selectedRef, setSelectedRef] = useState<ImageMetadata | null>(null);
  const [selectedSrc, setSelectedSrc] = useState<ImageMetadata | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  
  const [uploadedRefs, setUploadedRefs] = useState<ImageMetadata[]>([]);
  const [uploadedSrcs, setUploadedSrcs] = useState<ImageMetadata[]>([]);

  // Combine demo observations with uploaded ones
  const availableRefs = [...uploadedRefs, ...DEMO_OBSERVATIONS];
  const availableSrcs = [...uploadedSrcs, ...DEMO_OBSERVATIONS].filter((o) => o.id !== selectedRef?.id);

  const handleSelectRef = useCallback((obs: ImageMetadata) => {
    setSelectedRef((prev) => (prev?.id === obs.id ? null : obs));
  }, []);

  const handleSelectSrc = useCallback((obs: ImageMetadata) => {
    setSelectedSrc((prev) => (prev?.id === obs.id ? null : obs));
  }, []);

  const handleInitiate = () => {
    if (selectedRef && selectedSrc) {
      setReferenceImage(selectedRef);
      setSourceImage(selectedSrc);
      setView('acquisition');
    }
  };

  const canInitiate = selectedRef && selectedSrc && selectedRef.id !== selectedSrc.id;

  return (
    <div className="explorer">
      {/* 3D Scene — Moon fills the viewport */}
      <div className="explorer__canvas">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <StarField count={2000} radius={50} />
          <LunarGlobe radius={2} interactive={true} sunDirection={sunDirection} />
        </Canvas>
      </div>

      {/* HUD Overlay */}
      <HUD />

      {/* Top navigation */}
      <div className="explorer__nav">
        <button className="explorer__back" onClick={() => setView('landing')}>
          ← BACK
        </button>
        <div className="explorer__title">
          <span className="label">LUNAR EXPLORATION</span>
        </div>
        <button
          className="explorer__panel-toggle"
          onClick={() => setShowPanel(!showPanel)}
        >
          {showPanel ? 'HIDE' : 'DATA'}
        </button>
      </div>

      {/* Selection panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="explorer__panel"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="explorer__panel-header">
              <span className="label">SELECT OBSERVATIONS</span>
            </div>

            {/* Sensor legend */}
            <div className="explorer__legend">
              {Object.values(SENSORS).map((s) => (
                <div key={s.id} className="explorer__legend-item">
                  <span
                    className="explorer__legend-dot"
                    style={{
                      background:
                        s.id === 'OHRC'
                          ? 'var(--color-ohrc)'
                          : s.id === 'TMC2'
                          ? 'var(--color-tmc)'
                          : 'var(--color-iirs)',
                    }}
                  />
                  <span className="explorer__legend-label">{s.name}</span>
                  <span className="explorer__legend-gsd">{s.gsd} {s.gsdUnit}</span>
                </div>
              ))}
            </div>

            {/* Reference selection */}
            <div className="explorer__section">
              <div className="explorer__section-title">
                <span className="label label--accent">① REFERENCE IMAGE</span>
              </div>
              <div className="explorer__cards">
                {availableRefs.map((obs) => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    role="reference"
                    selected={selectedRef?.id === obs.id}
                    onSelect={() => handleSelectRef(obs)}
                  />
                ))}
              </div>
              <ImageUploader 
                role="reference" 
                onUpload={(metadata) => {
                  setUploadedRefs((prev) => [metadata, ...prev]);
                  setSelectedRef(metadata);
                }} 
              />
            </div>

            {/* Source selection */}
            <div className="explorer__section">
              <div className="explorer__section-title">
                <span className="label label--accent">② SOURCE IMAGE</span>
              </div>
              <div className="explorer__cards">
                {availableSrcs.map((obs) => (
                  <ObservationCard
                    key={obs.id}
                    observation={obs}
                    role="source"
                    selected={selectedSrc?.id === obs.id}
                    onSelect={() => handleSelectSrc(obs)}
                  />
                ))}
              </div>
              <ImageUploader 
                role="source" 
                onUpload={(metadata) => {
                  setUploadedSrcs((prev) => [metadata, ...prev]);
                  setSelectedSrc(metadata);
                }} 
              />
            </div>

            {/* Initiate button */}
            <motion.button
              className={`explorer__initiate ${canInitiate ? 'explorer__initiate--ready' : ''}`}
              disabled={!canInitiate}
              onClick={handleInitiate}
              whileHover={canInitiate ? { scale: 1.01 } : {}}
              whileTap={canInitiate ? { scale: 0.99 } : {}}
            >
              {canInitiate ? 'INITIATE CORRESPONDENCE' : 'SELECT IMAGE PAIR'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

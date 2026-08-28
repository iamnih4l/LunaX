/* ─── Acquisition Geometry View ─── */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import LunarGlobe from '../components/LunarGlobe';
import StarField from '../components/StarField';
import HUD from '../components/HUD';
import './Acquisition.css';

/* Helper to get 3D pos from lat/lon */
function getVectorFromLatLon(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Acquisition() {
  const { setView, referenceImage, sourceImage } = useAppStore();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!referenceImage || !sourceImage) {
      setView('explorer');
    }
  }, [referenceImage, sourceImage, setView]);

  if (!referenceImage || !sourceImage) return null;

  const targetPoint = useMemo(() => {
    // Look at reference image center
    return getVectorFromLatLon(referenceImage.footprint.center.lat, referenceImage.footprint.center.lon, 2);
  }, [referenceImage]);

  // Compute Sun Vector for Reference (Yellow)
  const refSunStart = targetPoint.clone().multiplyScalar(1.001);
  const refSunAzimuth = referenceImage.acquisition.sunAzimuth * (Math.PI / 180);
  const refSunElevation = referenceImage.acquisition.sunElevation * (Math.PI / 180);
  // simplified sun vector calculation (relative to surface normal)
  const refSunEnd = refSunStart.clone().add(
    new THREE.Vector3(Math.cos(refSunElevation) * Math.cos(refSunAzimuth), Math.sin(refSunElevation), Math.cos(refSunElevation) * Math.sin(refSunAzimuth)).multiplyScalar(1.5)
  );

  // Compute Spacecraft Vector for Source (Blue/Green)
  const srcStart = getVectorFromLatLon(sourceImage.footprint.center.lat, sourceImage.footprint.center.lon, 2).multiplyScalar(1.001);
  const srcViewAngle = sourceImage.acquisition.viewingAngle * (Math.PI / 180);
  const srcEnd = srcStart.clone().add(
    srcStart.clone().normalize().applyAxisAngle(new THREE.Vector3(1, 0, 0), srcViewAngle).multiplyScalar(1.5)
  );

  return (
    <div className="acquisition">
      <div className="acquisition__canvas">
        <Canvas
          camera={{ position: [targetPoint.x * 2, targetPoint.y * 2, targetPoint.z * 2], fov: 35 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <StarField count={2000} radius={50} />
          
          {/* Subtle ambient light */}
          <ambientLight intensity={0.1} color="#ffffff" />
          
          <LunarGlobe radius={2} interactive={false} sunDirection={[refSunEnd.x, refSunEnd.y, refSunEnd.z]} />
          
          {/* Acquisition Vectors */}
          <group>
            {/* Reference Sun Vector */}
            <Line
              points={[refSunStart, refSunEnd]}
              color="yellow"
              lineWidth={2}
              dashed={true}
              dashScale={2}
              dashSize={0.1}
              dashOffset={0.1}
            />
            
            {/* Source Viewing Vector */}
            <Line
              points={[srcStart, srcEnd]}
              color="#00ffff"
              lineWidth={2}
              dashed={false}
            />
          </group>

          <OrbitControls 
            ref={controlsRef}
            target={targetPoint}
            enablePan={false}
            minDistance={2.1}
            maxDistance={4}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      <HUD />

      <div className="acquisition__overlay">
        <div className="acquisition__topbar">
          <button className="acquisition__back" onClick={() => setView('explorer')}>
            ← BACK TO EXPLORER
          </button>
          <div className="acquisition__title">
            <span className="label">ACQUISITION GEOMETRY</span>
          </div>
        </div>

        <motion.div 
          className="acquisition__panel"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="acquisition__heading">Registration Complexity</h2>
          <p className="acquisition__desc">
            Co-registering these observations requires neutralizing extreme differences in scale, perspective, and illumination.
          </p>

          <div className="acquisition__delta">
            <div className="acquisition__delta-item">
              <span className="label">SCALE DELTA</span>
              <span className="acquisition__delta-val">
                {Math.max(referenceImage.gsd, sourceImage.gsd) / Math.min(referenceImage.gsd, sourceImage.gsd)}x
              </span>
              <span className="acquisition__delta-sub">Original GSD ratio</span>
            </div>
            
            <div className="acquisition__delta-item">
              <span className="label">ILLUMINATION DELTA</span>
              <span className="acquisition__delta-val">
                {Math.abs(referenceImage.acquisition.sunElevation - sourceImage.acquisition.sunElevation).toFixed(1)}°
              </span>
              <span className="acquisition__delta-sub">Sun Elevation difference</span>
            </div>
          </div>

          <div className="acquisition__legend">
            <div className="acquisition__legend-item">
              <span className="acquisition__legend-color" style={{background: 'yellow'}} />
              <span>Reference Solar Incidence</span>
            </div>
            <div className="acquisition__legend-item">
              <span className="acquisition__legend-color" style={{background: '#00ffff'}} />
              <span>Source View Angle</span>
            </div>
          </div>

          <button 
            className="acquisition__proceed"
            onClick={() => setView('workspace')}
          >
            PROCEED TO WORKSPACE →
          </button>
        </motion.div>
      </div>
    </div>
  );
}

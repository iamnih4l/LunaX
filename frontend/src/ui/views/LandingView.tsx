import { useAppStore } from '../../store/useAppStore';
import { Canvas } from '@react-three/fiber';
import LunarGlobe from '../components/LunarGlobe';

export default function LandingView() {
  const setView = useAppStore((state) => state.setView);

  return (
    <div className="view-container" style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <LunarGlobe />
        </Canvas>
      </div>
      
      {/* Overlay Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        background: 'radial-gradient(circle at center, rgba(17,17,17,0.7), transparent)',
        pointerEvents: 'none' // allow clicking the globe if we want, or disable to only click button
      }}>
        <h1 className="text-xl font-mono text-center" style={{ color: 'var(--color-accent-blue)', textShadow: 'var(--shadow-glow)', fontSize: '4rem', marginBottom: '1rem', pointerEvents: 'auto' }}>
          LunaX
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1.2rem', pointerEvents: 'auto' }}>
          Lunar Multi-Sensor Registration Pipeline
        </p>
        <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', pointerEvents: 'auto' }} onClick={() => setView('explorer')}>
          ENTER OBSERVATORY
        </button>
      </div>
    </div>
  );
}

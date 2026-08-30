import { useAppStore } from '../../store/useAppStore';

export default function LandingView() {
  const setView = useAppStore((state) => state.setView);

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'radial-gradient(circle at center, #111, #000)' }}>
      <h1 className="text-xl font-mono text-center" style={{ color: 'var(--color-accent-blue)', textShadow: 'var(--shadow-glow)' }}>
        LunaX
      </h1>
      <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Lunar Multi-Sensor Registration Pipeline
      </p>
      <button className="btn-primary" onClick={() => setView('explorer')}>
        ENTER OBSERVATORY
      </button>
    </div>
  );
}

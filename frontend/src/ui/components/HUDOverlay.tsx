import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export default function HUDOverlay({ children }: { children: React.ReactNode }) {
  const { isSimulationMode, setSimulationMode, hoverCoordinates } = useAppStore();

  return (
    <div className="hud-wrapper">
      {/* Scanline Effect */}
      <div className="scanlines"></div>
      
      {/* Top HUD Bar */}
      <div className="hud-header">
        <div className="hud-header-left">
          <span className="text-mono font-bold text-lg" style={{ color: 'var(--color-accent-blue)', textShadow: 'var(--shadow-glow)' }}>LunaX</span>
          <span className="label" style={{ marginLeft: '1rem' }}>v2.0.4-beta</span>
        </div>
        
        <div className="hud-header-center">
          <div className="hud-warning-stripes"></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 1rem', minWidth: '220px' }}>
            <span className="label">SYSTEM TELEMETRY</span>
            {hoverCoordinates ? (
              <span className="text-mono text-xs" style={{ color: 'var(--color-accent-green)', marginTop: '4px' }}>
                LAT: {hoverCoordinates.lat.toFixed(4)}° / LON: {hoverCoordinates.lon.toFixed(4)}°
              </span>
            ) : (
              <span className="text-mono text-xs" style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                TARGET ACQUISITION PENDING
              </span>
            )}
          </div>
          <div className="hud-warning-stripes"></div>
        </div>

        <div className="hud-header-right">
          <label className="hud-toggle">
            <span className="label" style={{ marginRight: '0.5rem', color: isSimulationMode ? 'var(--color-accent-orange)' : 'var(--color-text-secondary)' }}>SIMULATION MODE</span>
            <input 
              type="checkbox" 
              checked={isSimulationMode} 
              onChange={(e) => setSimulationMode(e.target.checked)} 
              style={{ accentColor: 'var(--color-accent-orange)', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      {/* Main Content Area (Wrapped) */}
      <div className="hud-content">
        {children}
      </div>
      
      {/* Bottom HUD Bar */}
      <div className="hud-footer">
        <div className="text-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {new Date().toISOString()} | SYS_NOMINAL
        </div>
        <div className="text-mono text-xs" style={{ color: isSimulationMode ? 'var(--color-accent-orange)' : 'var(--color-accent-green)' }}>
          LINK: {isSimulationMode ? 'MOCK_INTERNAL' : 'API_SECURE'}
        </div>
      </div>
    </div>
  );
}

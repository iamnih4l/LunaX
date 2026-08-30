import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { InternalObservation } from '../../core/types';

import { Canvas } from '@react-three/fiber';
import LunarGlobe from '../components/LunarGlobe';

export default function ExplorerView() {
  const { getApi, setReferenceImage, setSourceImage, setView, referenceImage, sourceImage, targetCoordinates, manualSourceCoords, setManualSourceCoords } = useAppStore();
  const [observations, setObservations] = useState<InternalObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');

  useEffect(() => {
    const api = getApi();
    api.getAvailableObservations()
      .then((data: InternalObservation[]) => {
        setObservations(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Failed to fetch observations", err);
        setLoading(false);
      });
  }, [getApi]);

  const handleSelectRef = (obs: InternalObservation) => {
    setReferenceImage(referenceImage?.id === obs.id ? null : obs);
  };

  const handleSelectSrc = (obs: InternalObservation) => {
    setSourceImage(sourceImage?.id === obs.id ? null : obs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setReferenceImage({
          id: `custom-${Date.now()}`,
          datasetId: file.name,
          sensor: 'CUSTOM',
          previewUrl: url,
          gsd: 1.0,
          acquisitionTime: new Date().toISOString(),
          footprint: { center: { lat: 0, lon: 0 }, vertices: [] }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualCoordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon)) {
      setManualSourceCoords({ lat, lon });
      setSourceImage({
          id: `manual-coords`,
          datasetId: 'manual_target',
          sensor: 'MANUAL',
          previewUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
          gsd: 1.0,
          acquisitionTime: new Date().toISOString(),
          footprint: { center: { lat, lon }, vertices: [] }
      });
    }
  };

  const canProceed = referenceImage && sourceImage && referenceImage.id !== sourceImage.id;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
      
      {/* 3D Canvas / Immersive Background */}
      <div style={{ flex: 1, backgroundColor: '#050505', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <LunarGlobe />
        </Canvas>
      </div>

      {/* Side Panel for Selection */}
      <div className="panel" style={{ width: '450px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: 'var(--border-subtle)', background: 'rgba(10, 10, 12, 0.95)', overflowY: 'auto' }}>
        <div>
          <h2 className="label" style={{ marginBottom: '1rem' }}>OBSERVATION DATASET</h2>
        </div>

        {targetCoordinates && (
          <div className="panel" style={{ padding: '1rem', background: 'rgba(255, 85, 0, 0.1)', border: '1px solid var(--color-accent-orange)', borderRadius: 'var(--radius-sm)' }}>
            <div className="label" style={{ color: 'var(--color-accent-orange)' }}>AOI LOCKED</div>
            <div className="text-mono text-sm" style={{ color: 'var(--color-accent-orange)', marginTop: '0.5rem' }}>
              LAT: {targetCoordinates.lat.toFixed(4)}°<br/>LON: {targetCoordinates.lon.toFixed(4)}°
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>Loading telemetry...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Reference Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 className="label label--accent">① REFERENCE IMAGE</h3>
                <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => fileInputRef.current?.click()}>UPLOAD CUSTOM</button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {referenceImage?.sensor === 'CUSTOM' && (
                  <div style={{ padding: '0.75rem', border: 'var(--border-accent)', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 210, 255, 0.1)' }}>
                    <div className="text-mono text-sm">CUSTOM UPLOAD</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{referenceImage.datasetId}</div>
                  </div>
                )}
                {observations.map(obs => (
                  <div 
                    key={obs.id}
                    onClick={() => handleSelectRef(obs)}
                    style={{ 
                      padding: '0.75rem', 
                      border: referenceImage?.id === obs.id ? 'var(--border-accent)' : 'var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: referenceImage?.id === obs.id ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="text-mono text-sm">{obs.sensor}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{obs.datasetId}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Selection & Manual Coords */}
            <div>
              <h3 className="label label--accent" style={{ marginBottom: '0.5rem' }}>② SOURCE IMAGE</h3>
              
              <form onSubmit={handleManualCoordsSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Lat" value={latInput} onChange={e => setLatInput(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: '#111', border: 'var(--border-subtle)', color: '#fff', borderRadius: '4px' }} />
                <input type="text" placeholder="Lon" value={lonInput} onChange={e => setLonInput(e.target.value)} style={{ flex: 1, padding: '0.5rem', background: '#111', border: 'var(--border-subtle)', color: '#fff', borderRadius: '4px' }} />
                <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }}>SET</button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sourceImage?.sensor === 'MANUAL' && (
                  <div style={{ padding: '0.75rem', border: 'var(--border-accent)', borderRadius: 'var(--radius-sm)', background: 'rgba(0, 210, 255, 0.1)' }}>
                    <div className="text-mono text-sm">MANUAL TARGET</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Lat: {manualSourceCoords?.lat} / Lon: {manualSourceCoords?.lon}</div>
                  </div>
                )}
                {observations.map(obs => (
                  <div 
                    key={obs.id}
                    onClick={() => handleSelectSrc(obs)}
                    style={{ 
                      padding: '0.75rem', 
                      border: sourceImage?.id === obs.id ? 'var(--border-accent)' : 'var(--border-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: sourceImage?.id === obs.id ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                      transition: 'all 0.2s',
                      opacity: referenceImage?.id === obs.id ? 0.5 : 1,
                      pointerEvents: referenceImage?.id === obs.id ? 'none' : 'auto'
                    }}
                  >
                    <div className="text-mono text-sm">{obs.sensor}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{obs.datasetId}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%' }}
            disabled={!canProceed}
            onClick={() => setView('correspondence')}
          >
            INITIATE REGISTRATION
          </button>
        </div>
      </div>
    </div>
  );
}

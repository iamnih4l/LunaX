/* ─── ObservationCard ─── */
/* Scientific data card for a lunar observation */

import type { ImageMetadata } from '../types';
import { SENSORS } from '../api/mock';
import SensorBadge from './SensorBadge';
import './ObservationCard.css';

interface ObservationCardProps {
  observation: ImageMetadata;
  role?: 'reference' | 'source' | null;
  onSelect?: () => void;
  selected?: boolean;
}

export default function ObservationCard({
  observation,
  role,
  onSelect,
  selected = false,
}: ObservationCardProps) {
  const sensor = SENSORS[observation.sensor];

  return (
    <button
      className={`obs-card ${selected ? 'obs-card--selected' : ''} ${role ? `obs-card--${role}` : ''}`}
      onClick={onSelect}
    >
      {/* Role label */}
      {role && (
        <div className="obs-card__role">
          {role === 'reference' ? 'REFERENCE' : 'SOURCE'}
        </div>
      )}

      {/* Header */}
      <div className="obs-card__header">
        <SensorBadge sensor={observation.sensor} size="md" />
        <span className="obs-card__gsd">
          {sensor.gsd} {sensor.gsdUnit}
        </span>
      </div>

      {/* Sensor name */}
      <div className="obs-card__sensor-name">{sensor.fullName}</div>

      {/* Metadata grid */}
      <div className="obs-card__meta">
        <div className="obs-card__meta-item">
          <span className="obs-card__meta-label">ORBIT</span>
          <span className="obs-card__meta-value">{observation.acquisition.orbitNumber}</span>
        </div>
        <div className="obs-card__meta-item">
          <span className="obs-card__meta-label">SUN ELEV</span>
          <span className="obs-card__meta-value">{observation.acquisition.sunElevation.toFixed(1)}°</span>
        </div>
        <div className="obs-card__meta-item">
          <span className="obs-card__meta-label">INCIDENCE</span>
          <span className="obs-card__meta-value">{observation.acquisition.incidenceAngle.toFixed(1)}°</span>
        </div>
        <div className="obs-card__meta-item">
          <span className="obs-card__meta-label">GSD</span>
          <span className="obs-card__meta-value">{observation.gsd} m</span>
        </div>
      </div>

      {/* Coordinates */}
      <div className="obs-card__coords">
        {observation.footprint.center.lat.toFixed(2)}° N, {Math.abs(observation.footprint.center.lon).toFixed(2)}° {observation.footprint.center.lon >= 0 ? 'E' : 'W'}
      </div>
    </button>
  );
}

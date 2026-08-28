/* ─── SensorBadge ─── */
/* Compact sensor identifier with color coding */

import type { SensorId } from '../types';
import './SensorBadge.css';

interface SensorBadgeProps {
  sensor: SensorId;
  size?: 'sm' | 'md';
}

const SENSOR_LABELS: Record<SensorId, string> = {
  OHRC: 'OHRC',
  TMC2: 'TMC-2',
  IIRS: 'IIRS',
};

export default function SensorBadge({ sensor, size = 'sm' }: SensorBadgeProps) {
  return (
    <span className={`sensor-badge sensor-badge--${sensor.toLowerCase()} sensor-badge--${size}`}>
      {SENSOR_LABELS[sensor]}
    </span>
  );
}

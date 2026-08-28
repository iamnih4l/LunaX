/* ─── MetricsPanel ─── */
/* Scientific metrics display for evaluation results */

import type { EvaluationMetrics } from '../types';
import './MetricsPanel.css';

interface MetricsPanelProps {
  metrics: EvaluationMetrics;
  isDemo?: boolean;
}

interface MetricItemProps {
  label: string;
  value: string | number | null;
  unit?: string;
}

function MetricItem({ label, value, unit }: MetricItemProps) {
  return (
    <div className="metric-item">
      <div className="metric-item__label">{label}</div>
      <div className="metric-item__value">
        {value !== null ? (
          <>
            <span className="metric-item__number">{value}</span>
            {unit && <span className="metric-item__unit">{unit}</span>}
          </>
        ) : (
          <span className="metric-item__pending">—</span>
        )}
      </div>
    </div>
  );
}

export default function MetricsPanel({ metrics, isDemo = false }: MetricsPanelProps) {
  return (
    <div className="metrics-panel">
      <div className="metrics-panel__header">
        <span className="label">EVALUATION METRICS</span>
        {isDemo && <span className="metrics-panel__demo">DEMO</span>}
      </div>
      <div className="metrics-panel__grid">
        <MetricItem
          label="TIEPOINT RMSE"
          value={metrics.rmse !== null ? metrics.rmse.toFixed(2) : null}
          unit="m"
        />
        <MetricItem
          label="INLIER RATIO"
          value={metrics.inlierRatio !== null ? (metrics.inlierRatio * 100).toFixed(1) : null}
          unit="%"
        />
        <MetricItem
          label="UNIFORMITY"
          value={metrics.uniformityScore !== null ? metrics.uniformityScore.toFixed(3) : null}
          unit="σ²"
        />
        <MetricItem
          label="PROCESSING TIME"
          value={metrics.processingTime !== null ? metrics.processingTime.toFixed(1) : null}
          unit="s"
        />
        <MetricItem
          label="TOTAL MATCHES"
          value={metrics.totalMatches}
        />
        <MetricItem
          label="INLIERS"
          value={metrics.totalInliers}
        />
      </div>
    </div>
  );
}

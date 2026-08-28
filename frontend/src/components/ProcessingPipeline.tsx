/* ─── ProcessingPipeline ─── */
/* Vertical pipeline stage tracker with status indicators */

import type { ProcessingStage } from '../types';
import './ProcessingPipeline.css';

interface ProcessingPipelineProps {
  stages: ProcessingStage[];
  currentStageId?: string;
}

export default function ProcessingPipeline({ stages, currentStageId }: ProcessingPipelineProps) {
  return (
    <div className="pipeline">
      <div className="pipeline__header">
        <span className="label">REGISTRATION PIPELINE</span>
      </div>
      <div className="pipeline__stages">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`pipeline__stage pipeline__stage--${stage.status.toLowerCase()} ${stage.id === currentStageId ? 'pipeline__stage--current' : ''}`}
          >
            {/* Connector line */}
            {index > 0 && <div className="pipeline__connector" />}

            {/* Status indicator */}
            <div className="pipeline__indicator">
              {stage.status === 'COMPLETED' && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polyline points="2,5 4,7 8,3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
              {stage.status === 'RUNNING' && (
                <div className="pipeline__spinner" />
              )}
              {stage.status === 'FAILED' && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <line x1="3" y1="3" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="7" y1="3" x2="3" y2="7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </div>

            {/* Stage info */}
            <div className="pipeline__info">
              <div className="pipeline__name">{stage.shortName}</div>
              {stage.method && (
                <div className="pipeline__method">{stage.method}</div>
              )}
            </div>

            {/* Status label */}
            <div className="pipeline__status">{stage.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import type { ImageMetadata, Correspondence } from '../types';
import './CorrespondenceViewer.css';

interface CorrespondenceViewerProps {
  referenceImage: ImageMetadata;
  sourceImage: ImageMetadata;
  stageId?: string;
  correspondences: Correspondence[];
  showGrid?: boolean;
}

export default function CorrespondenceViewer({
  referenceImage,
  sourceImage,
  stageId,
  correspondences,
  showGrid = false
}: CorrespondenceViewerProps) {
  
  // Decide what to show based on the pipeline stage
  const showFeatures = ['feature_extraction', 'feature_matching', 'match_regularization', 'robust_fitting', 'local_warping', 'subpixel_refinement', 'product_generation'].includes(stageId || '');
  const showLines = ['feature_matching', 'match_regularization', 'robust_fitting', 'local_warping', 'subpixel_refinement', 'product_generation'].includes(stageId || '');
  const showBucketing = ['match_regularization', 'robust_fitting', 'local_warping', 'subpixel_refinement', 'product_generation'].includes(stageId || '') || showGrid;
  const showInliersOnly = ['robust_fitting', 'local_warping', 'subpixel_refinement', 'product_generation'].includes(stageId || '');
  const showWarping = ['local_warping', 'subpixel_refinement', 'product_generation'].includes(stageId || '');

  // Render variables
  // In a real app we'd map coordinates from image space to screen space.
  // Here we assume the SVG is 800x600 for source and 800x600 for ref, side by side.
  const width = 800;
  const height = 600;
  const gap = 100; // gap between images
  
  // Prepare Grid
  const gridRows = 16;
  const gridCols = 16;
  
  // Filter matches based on stage
  const visibleCorrespondences = useMemo(() => {
    if (!showLines) return [];
    if (showInliersOnly) return correspondences.filter(c => c.isInlier);
    return correspondences;
  }, [correspondences, showLines, showInliersOnly]);

  return (
    <div className="corr-viewer">
      <svg 
        className={`corr-viewer__svg ${showWarping ? 'corr-viewer__svg--warping' : ''}`}
        viewBox={`0 0 ${width * 2 + gap} ${height}`} 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Reference Image */}
        <image 
          xlinkHref={referenceImage.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} 
          x={0} y={0} width={width} height={height} 
          preserveAspectRatio="xMidYMid slice" 
          opacity={0.8}
        />
        <rect x={0} y={0} width={width} height={height} className="corr-viewer__img-box" />
        <text x={width / 2} y={height / 2} className="corr-viewer__img-text" textAnchor="middle" opacity={0.5}>
          {referenceImage.sensor} REFERENCE
        </text>

        {/* Source Image */}
        <image 
          xlinkHref={sourceImage.previewUrl || 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'} 
          x={width + gap} y={0} width={width} height={height} 
          preserveAspectRatio="xMidYMid slice" 
          opacity={0.8}
        />
        <rect x={width + gap} y={0} width={width} height={height} className="corr-viewer__img-box" />
        <text x={width + gap + width / 2} y={height / 2} className="corr-viewer__img-text" textAnchor="middle" opacity={0.5}>
          {sourceImage.sensor} SOURCE
        </text>

        {/* Spatial Bucketing Grid */}
        {showBucketing && (
          <g className="corr-viewer__grid">
            {/* Grid on Ref */}
            {Array.from({ length: gridRows + 1 }).map((_, i) => (
              <line key={`h-ref-${i}`} x1={0} y1={(height/gridRows)*i} x2={width} y2={(height/gridRows)*i} className="corr-viewer__grid-line" />
            ))}
            {Array.from({ length: gridCols + 1 }).map((_, i) => (
              <line key={`v-ref-${i}`} x1={(width/gridCols)*i} y1={0} x2={(width/gridCols)*i} y2={height} className="corr-viewer__grid-line" />
            ))}
            
            {/* Grid on Src */}
            {Array.from({ length: gridRows + 1 }).map((_, i) => (
              <line key={`h-src-${i}`} x1={width+gap} y1={(height/gridRows)*i} x2={width+gap+width} y2={(height/gridRows)*i} className="corr-viewer__grid-line" />
            ))}
            {Array.from({ length: gridCols + 1 }).map((_, i) => (
              <line key={`v-src-${i}`} x1={width+gap+(width/gridCols)*i} y1={0} x2={width+gap+(width/gridCols)*i} y2={height} className="corr-viewer__grid-line" />
            ))}
          </g>
        )}

        {/* Lines */}
        {showLines && visibleCorrespondences.map(c => {
          const isOutlier = showInliersOnly ? false : !c.isInlier;
          // Coordinates are mock, assuming they are 0-1000 range in mock data. Let's scale them to our 800x600 box.
          const rx = (c.reference.x / 1000) * width;
          const ry = (c.reference.y / 1000) * height;
          const sx = width + gap + (c.source.x / 1000) * width;
          const sy = (c.source.y / 1000) * height;

          return (
            <line 
              key={`line-${c.id}`} 
              x1={rx} y1={ry} x2={sx} y2={sy} 
              className={`corr-viewer__line ${isOutlier ? 'corr-viewer__line--outlier' : ''}`}
            />
          );
        })}

        {/* Points */}
        {showFeatures && visibleCorrespondences.map(c => {
          const rx = (c.reference.x / 1000) * width;
          const ry = (c.reference.y / 1000) * height;
          const sx = width + gap + (c.source.x / 1000) * width;
          const sy = (c.source.y / 1000) * height;
          const isOutlier = showInliersOnly ? false : !c.isInlier;

          return (
            <g key={`pts-${c.id}`}>
              <circle cx={rx} cy={ry} r={4} className={`corr-viewer__point ${isOutlier ? 'corr-viewer__point--outlier' : ''}`} />
              <circle cx={sx} cy={sy} r={4} className={`corr-viewer__point ${isOutlier ? 'corr-viewer__point--outlier' : ''}`} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

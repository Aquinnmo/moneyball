import { useRef, useState } from 'react';
import type { GraphDataPoint, GraphSortDirection } from '../types';
import './Graph.css';

export interface HorizontalBarGraphProps {
  /** The title rendered above the graph. */
  title: string;
  /** Generic rows with player label, value, team side, and tooltip fields. */
  data: GraphDataPoint[];
  /** Number of decimal places to render for bar labels. */
  roundTo: number;
  /** Sort direction for the rendered rows. */
  sortDirection?: GraphSortDirection;
}

function getTooltipPosition(clientX: number, clientY: number): { x: number; y: number } {
  let x = clientX + 15;
  let y = clientY + 15;
  const estimatedTooltipWidth = 230;
  const estimatedTooltipHeight = 280;

  if (clientX + estimatedTooltipWidth > window.innerWidth) {
    x = clientX - estimatedTooltipWidth - 15;
  }

  if (clientY + estimatedTooltipHeight > window.innerHeight) {
    y = window.innerHeight - estimatedTooltipHeight - 15;
  }

  return { x, y };
}

/**
 * HorizontalBarGraph Component
 *
 * Renders generic non-negative graph data as high-to-low horizontal bars.
 *
 * @param props.title - The title rendered above the graph.
 * @param props.data - Prepared graph data points.
 * @param props.roundTo - Number of decimal places for values.
 * @param props.sortDirection - Whether rows render low-to-high or high-to-low.
 */
export function HorizontalBarGraph({ title, data, roundTo, sortDirection = 'des' }: HorizontalBarGraphProps) {
  const [hoveredData, setHoveredData] = useState<GraphDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const sortedData = [...data].sort((a, b) => (sortDirection === 'asc' ? a.value - b.value : b.value - a.value));
  const maxVal = Math.max(...data.map((point) => point.value), 0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, point: GraphDataPoint) => {
    setHoveredData(point);
    setTooltipPos(getTooltipPosition(event.clientX, event.clientY));
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
  };

  return (
    <div className="graph-container" ref={containerRef}>
      <h3 className="graph-title">{title}</h3>
      <div className="graph-body">
        {sortedData.map((point) => {
          const widthPercentage = maxVal > 0 ? (Math.max(point.value, 0) / maxVal) * 100 : 0;

          return (
            <div
              key={point.id}
              className="graph-row"
              onMouseMove={(event) => handleMouseMove(event, point)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="graph-label" title={point.label}>
                {point.label}
              </div>
              <div className="graph-track horizontal">
                <div
                  className={`graph-fill horizontal ${point.isHomeTeam ? 'home' : 'away'}`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  <span className={`graph-value-label horizontal ${widthPercentage > 15 ? 'inside' : 'outside'}`}>
                    {point.value.toFixed(roundTo)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {hoveredData && (
          <div className="graph-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
            <h4>{hoveredData.label}</h4>
            <div className="graph-tooltip-grid">
              {Object.entries(hoveredData.tooltipData).map(([key, value]) => (
                <span key={key} style={{ display: 'contents' }}>
                  <span className="graph-tooltip-label">{key}</span>
                  <span className="graph-tooltip-val">{value ?? 'N/A'}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

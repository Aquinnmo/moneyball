import { useRef, useState } from 'react';
import type { GraphDataPoint, GraphSortDirection } from '../types';
import { formatNumber, formatPercent } from './format';
import './Graph.css';
import './PieGraph.css';

export interface PieGraphProps {
  /** The title rendered above the graph. */
  title: string;
  /** Generic rows with player label, value, team side, and tooltip fields. */
  data: GraphDataPoint[];
  /** Number of decimal places to render for raw values. */
  roundTo: number;
  /** Sort direction for slice and legend order. */
  sortDirection?: GraphSortDirection;
}

interface PieSlice {
  color: string;
  endAngle: number;
  path: string;
  point: GraphDataPoint;
  share: number;
  startAngle: number;
}

const chartCenter = 120;
const chartRadius = 88;
const awaySliceColors = ['#ef4444', '#f97316', '#fb7185', '#dc2626', '#f43f5e', '#f59e0b'];
const homeSliceColors = ['#3b82f6', '#06b6d4', '#60a5fa', '#2563eb', '#22d3ee', '#38bdf8'];

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

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeSlice(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(chartCenter, chartCenter, chartRadius, endAngle);
  const end = polarToCartesian(chartCenter, chartCenter, chartRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${chartCenter} ${chartCenter}`,
    `L ${start.x} ${start.y}`,
    `A ${chartRadius} ${chartRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function createPieSlices(data: GraphDataPoint[], sortDirection: GraphSortDirection): PieSlice[] {
  const sortedData = data
    .filter((point) => point.value > 0)
    .sort((a, b) => (sortDirection === 'asc' ? a.value - b.value : b.value - a.value));
  const total = sortedData.reduce((sum, point) => sum + point.value, 0);
  let currentAngle = 0;
  let awayIndex = 0;
  let homeIndex = 0;

  if (total <= 0) {
    return [];
  }

  return sortedData.map((point) => {
    const share = point.value / total;
    const startAngle = currentAngle;
    const endAngle = currentAngle + share * 359.999;
    const palette = point.isHomeTeam ? homeSliceColors : awaySliceColors;
    const colorIndex = point.isHomeTeam ? homeIndex : awayIndex;
    const color = palette[colorIndex % palette.length];

    currentAngle = endAngle;

    if (point.isHomeTeam) {
      homeIndex += 1;
    } else {
      awayIndex += 1;
    }

    return {
      color,
      endAngle,
      path: describeSlice(startAngle, endAngle),
      point,
      share,
      startAngle,
    };
  });
}

/**
 * PieGraph Component
 *
 * Renders selected non-negative player values as interactive contribution shares.
 *
 * @param props.title - The title rendered above the graph.
 * @param props.data - Prepared graph data points.
 * @param props.roundTo - Number of decimal places for values.
 * @param props.sortDirection - Whether slices render low-to-high or high-to-low.
 */
export function PieGraph({ title, data, roundTo, sortDirection = 'des' }: PieGraphProps) {
  const [hoveredSlice, setHoveredSlice] = useState<PieSlice | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const slices = createPieSlices(data, sortDirection);
  const total = slices.reduce((sum, slice) => sum + slice.point.value, 0);

  const handleMouseMove = (event: React.MouseEvent<Element>, slice: PieSlice) => {
    setHoveredSlice(slice);
    setTooltipPos(getTooltipPosition(event.clientX, event.clientY));
  };

  const handleFocus = (slice: PieSlice) => {
    const rect = containerRef.current?.getBoundingClientRect();

    setHoveredSlice(slice);
    setTooltipPos({
      x: rect ? rect.left + rect.width / 2 : 0,
      y: rect ? rect.top + 80 : 0,
    });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <div className="graph-container pie-graph-container" ref={containerRef}>
      <h3 className="graph-title">{title}</h3>
      {slices.length > 0 ? (
        <div className="pie-graph-layout">
          <div className="pie-graph-stage" aria-label={`${title} pie chart`}>
            <svg className="pie-graph-svg" viewBox="0 0 240 240" role="img" aria-label={title}>
              <circle className="pie-graph-radar-ring outer" cx={chartCenter} cy={chartCenter} r="105" />
              <circle className="pie-graph-radar-ring inner" cx={chartCenter} cy={chartCenter} r="70" />
              <line className="pie-graph-axis horizontal" x1="10" y1={chartCenter} x2="230" y2={chartCenter} />
              <line className="pie-graph-axis vertical" x1={chartCenter} y1="10" x2={chartCenter} y2="230" />
              {slices.map((slice) => (
                <path
                  aria-label={`${slice.point.label}: ${formatPercent(slice.share)} of ${title}`}
                  className={`pie-graph-slice ${hoveredSlice?.point.id === slice.point.id ? 'active' : ''}`}
                  d={slice.path}
                  fill={slice.color}
                  key={slice.point.id}
                  onBlur={handleMouseLeave}
                  onFocus={() => handleFocus(slice)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={(event) => handleMouseMove(event, slice)}
                  tabIndex={0}
                />
              ))}
              <circle className="pie-graph-center-node" cx={chartCenter} cy={chartCenter} r="34" />
            </svg>
            <div className="pie-graph-center-readout" aria-hidden="true">
              <span>Total</span>
              <strong>{formatNumber(total, roundTo)}</strong>
            </div>
          </div>

          {hoveredSlice && (
            <div className="graph-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
              <h4>{hoveredSlice.point.label}</h4>
              <div className="graph-tooltip-grid">
                <span className="graph-tooltip-label">Share</span>
                <span className="graph-tooltip-val">{formatPercent(hoveredSlice.share)}</span>
                {Object.entries(hoveredSlice.point.tooltipData).map(([key, value]) => (
                  <span key={key} style={{ display: 'contents' }}>
                    <span className="graph-tooltip-label">{key}</span>
                    <span className="graph-tooltip-val">{value ?? 'N/A'}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="pie-graph-empty">No positive share data available.</p>
      )}
    </div>
  );
}

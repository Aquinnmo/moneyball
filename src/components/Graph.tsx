import type { GraphDataPoint, GraphDisplayMode, GraphSortDirection, GraphValueMode } from '../types';
import { CenteredBarGraph } from './CenteredBarGraph';
import { HorizontalBarGraph } from './HorizontalBarGraph';
import { PieGraph } from './PieGraph';

export interface GraphProps {
  /** The title rendered above the graph. */
  title: string;
  /** Generic rows with player label, value, team side, and tooltip fields. */
  data: GraphDataPoint[];
  /** Number of decimal places to render for bar labels. */
  roundTo: number;
  /** Controls when the centered signed graph should be used. */
  valueMode?: GraphValueMode;
  /** Controls whether the graph should render as a bar graph or pie chart. */
  displayMode?: GraphDisplayMode;
  /** Sort direction for the rendered rows. */
  sortDirection?: GraphSortDirection;
}

function shouldUseCenteredGraph(data: GraphDataPoint[], valueMode: GraphValueMode): boolean {
  if (valueMode === 'signed') {
    return true;
  }

  if (valueMode === 'non-negative') {
    return false;
  }

  return data.some((point) => point.value < 0);
}

/**
 * Graph Component
 *
 * Chooses the correct bar graph for prepared graph data.
 *
 * @param props.title - The title rendered above the graph.
 * @param props.data - Prepared graph data points.
 * @param props.roundTo - Number of decimal places for values.
 * @param props.valueMode - Whether values are non-negative, signed, or auto-detected.
 * @param props.displayMode - Whether to force a pie chart instead of the bar graph auto-selection.
 * @param props.sortDirection - Whether rows render low-to-high or high-to-low.
 */
export function Graph({ title, data, roundTo, valueMode = 'auto', displayMode = 'auto', sortDirection = 'des' }: GraphProps) {
  if (displayMode === 'pie') {
    return <PieGraph title={title} data={data} roundTo={roundTo} sortDirection={sortDirection} />;
  }

  if (shouldUseCenteredGraph(data, valueMode)) {
    return <CenteredBarGraph title={title} data={data} roundTo={roundTo} sortDirection={sortDirection} />;
  }

  return <HorizontalBarGraph title={title} data={data} roundTo={roundTo} sortDirection={sortDirection} />;
}

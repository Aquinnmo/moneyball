export type GraphTooltipData = Record<string, string | number | null | undefined>;

export type GraphValueMode = 'auto' | 'non-negative' | 'signed';

export type GraphSortDirection = 'asc' | 'des';

export interface GraphDataPoint {
    id: string | number;
    label: string;
    value: number;
    isHomeTeam: boolean;
    tooltipData: GraphTooltipData;
}

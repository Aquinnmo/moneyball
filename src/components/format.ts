export function formatNumber(value: number | null | undefined, digits = 2): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : '--';
}

export function formatInteger(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value).toString() : '--';
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : '--';
}

export function formatSigned(value: number | null | undefined, digits = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}`;
}

export function getNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Converts Savant's "Last, First" player name format to "First Last". Names without a comma pass through unchanged. */
export function formatSavantName(name: string): string {
  const [last, first] = name.split(',').map((part) => part.trim());
  return first ? `${first} ${last}` : name;
}

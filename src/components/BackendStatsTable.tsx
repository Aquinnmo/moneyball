export type BackendStatsTableValue = string | number | boolean | null | undefined;

export interface BackendStatsTableColumn {
  /** Stable cell key for this table column. */
  key: string;
  /** Header label shown in the table. */
  label: string;
  /** Optional grouped header label for dense stat tables. */
  group?: string;
  /** Whether this column starts a visual table section. */
  sectionStart?: boolean;
}

export interface BackendStatsTableRow {
  /** Stable row id. */
  id: string;
  /** Row values keyed by column key. */
  cells: Record<string, BackendStatsTableValue>;
}

export interface BackendStatsTableProps {
  /** Table title for this backend stat group. */
  title: string;
  /** Column definitions for this stat table. */
  columns: BackendStatsTableColumn[];
  /** Backend stat rows to render. */
  rows: BackendStatsTableRow[];
  /** Column index where a visual table section should begin. */
  sectionStartColumnIndex?: number;
  /** Column indexes where visual table sections should begin. */
  sectionStartColumnIndexes?: number[];
  /** Row ids that should be preceded by a visual divider (e.g. a playoff cut line). */
  sectionStartRowIds?: string[];
  /** Enables vertical scrolling for dense tables while preserving horizontal scroll. */
  scrollable?: boolean;
  /** Additional class applied to the table element. */
  tableClassName?: string;
  /** Column key the table is currently sorted by, when sorting is controlled. */
  sortKey?: string;
  /** Direction of the active sort, when sorting is controlled. */
  sortDirection?: 'asc' | 'desc';
  /** Called with a column key when its header is activated. Enables sortable headers when provided. */
  onSortChange?: (key: string) => void;
}

interface BackendStatsTableColumnGroup {
  label: string;
  startIndex: number;
  span: number;
}

function formatBackendStatsTableValue(value: BackendStatsTableValue): string {
  if (value == null || value === '') {
    return '--';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  }

  return value;
}

function getColumnGroups(columns: BackendStatsTableColumn[]): BackendStatsTableColumnGroup[] {
  return columns.reduce<BackendStatsTableColumnGroup[]>((groups, column, index) => {
    const label = column.group ?? '';
    const currentGroup = groups[groups.length - 1];

    if (currentGroup && currentGroup.label === label) {
      currentGroup.span += 1;
      return groups;
    }

    groups.push({ label, startIndex: index, span: 1 });
    return groups;
  }, []);
}

function isSectionStart(
  column: BackendStatsTableColumn | undefined,
  index: number,
  sectionStartIndexes: Set<number>,
): boolean {
  return Boolean(column?.sectionStart) || sectionStartIndexes.has(index);
}

function ariaSortFor(
  columnKey: string,
  sortKey: string | undefined,
  sortDirection: 'asc' | 'desc' | undefined,
): 'ascending' | 'descending' | 'none' {
  if (columnKey !== sortKey) {
    return 'none';
  }

  return sortDirection === 'asc' ? 'ascending' : 'descending';
}

/**
 * Sorts backend stat table rows by a column key.
 *
 * Numeric cells compare numerically; everything else falls back to
 * locale-aware string comparison. Missing values (null, undefined, '')
 * always sort last regardless of direction. Returns a new array.
 *
 * @param rows - Rows to sort.
 * @param key - Column key to sort by.
 * @param direction - Sort direction.
 */
export function sortBackendStatsRows(
  rows: BackendStatsTableRow[],
  key: string,
  direction: 'asc' | 'desc',
): BackendStatsTableRow[] {
  const sign = direction === 'asc' ? 1 : -1;

  return [...rows].sort((rowA, rowB) => {
    const a = rowA.cells[key];
    const b = rowB.cells[key];
    const aEmpty = a == null || a === '';
    const bEmpty = b == null || b === '';

    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * sign;
    }

    return String(a).localeCompare(String(b)) * sign;
  });
}

/**
 * BackendStatsTable Component
 *
 * Renders backend stat tables with the same visual treatment as the linescore.
 *
 * @param props.title - Display title for the stat table.
 * @param props.columns - Column definitions for the table.
 * @param props.rows - Backend stat rows to show.
 * @param props.sectionStartColumnIndex - Column index where a visual section begins.
 * @param props.sectionStartColumnIndexes - Column indexes where visual sections begin.
 * @param props.sectionStartRowIds - Row ids preceded by a visual divider.
 * @param props.scrollable - Whether the table should vertically scroll.
 * @param props.tableClassName - Additional class applied to the table element.
 * @param props.sortKey - Column key the table is currently sorted by, when sorting is controlled.
 * @param props.sortDirection - Direction of the active sort, when sorting is controlled.
 * @param props.onSortChange - Called with a column key when its header is activated; enables sortable headers.
 */
export function BackendStatsTable({
  title,
  columns,
  rows,
  sectionStartColumnIndex = 1,
  sectionStartColumnIndexes,
  sectionStartRowIds,
  scrollable = false,
  tableClassName,
  sortKey,
  sortDirection,
  onSortChange,
}: BackendStatsTableProps) {
  const sectionStartIndexes = new Set(sectionStartColumnIndexes ?? [sectionStartColumnIndex]);
  const sectionStartRows = new Set(sectionStartRowIds ?? []);
  const hasColumnGroups = columns.some((column) => column.group);
  const columnGroups = hasColumnGroups ? getColumnGroups(columns) : [];
  const wrapperClassName = [
    'scoreboard-table-wrap',
    'backend-stats-table-wrap',
    scrollable ? 'backend-stats-table-scroll' : null,
  ].filter(Boolean).join(' ');
  const fullTableClassName = ['scoreboard-table', 'backend-stats-table', tableClassName].filter(Boolean).join(' ');

  return (
    <section className="backend-stats-section" aria-label={title}>
      <h3>{title}</h3>
      <div className={wrapperClassName}>
        <table className={fullTableClassName}>
          <thead>
            {hasColumnGroups ? (
              <tr className="backend-stats-table-groups">
                {columnGroups.map((group) => (
                  <th
                    className={isSectionStart(columns[group.startIndex], group.startIndex, sectionStartIndexes)
                      ? 'start-board-section'
                      : undefined}
                    colSpan={group.span}
                    key={`${group.label}-${group.startIndex}`}
                    scope="colgroup"
                  >
                    {group.label}
                  </th>
                ))}
              </tr>
            ) : null}
            <tr>
              {columns.map((column, index) => (
                <th
                  aria-sort={onSortChange ? ariaSortFor(column.key, sortKey, sortDirection) : undefined}
                  className={isSectionStart(column, index, sectionStartIndexes) ? 'start-board-section' : undefined}
                  key={column.key}
                  scope="col"
                >
                  {onSortChange ? (
                    <button
                      className="backend-stats-table-sort-button"
                      onClick={() => onSortChange(column.key)}
                      type="button"
                    >
                      {column.label}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className={sectionStartRows.has(row.id) ? 'start-board-row' : undefined} key={row.id}>
                {columns.map((column, index) => (
                  index === 0 ? (
                    <th key={column.key} scope="row">{formatBackendStatsTableValue(row.cells[column.key])}</th>
                  ) : (
                    <td
                      className={isSectionStart(column, index, sectionStartIndexes) ? 'start-board-section' : undefined}
                      key={column.key}
                    >
                      {formatBackendStatsTableValue(row.cells[column.key])}
                    </td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

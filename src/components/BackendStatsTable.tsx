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
  /** Enables vertical scrolling for dense tables while preserving horizontal scroll. */
  scrollable?: boolean;
  /** Additional class applied to the table element. */
  tableClassName?: string;
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
 * @param props.scrollable - Whether the table should vertically scroll.
 * @param props.tableClassName - Additional class applied to the table element.
 */
export function BackendStatsTable({
  title,
  columns,
  rows,
  sectionStartColumnIndex = 1,
  sectionStartColumnIndexes,
  scrollable = false,
  tableClassName,
}: BackendStatsTableProps) {
  const sectionStartIndexes = new Set(sectionStartColumnIndexes ?? [sectionStartColumnIndex]);
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
                  className={isSectionStart(column, index, sectionStartIndexes) ? 'start-board-section' : undefined}
                  key={column.key}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
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

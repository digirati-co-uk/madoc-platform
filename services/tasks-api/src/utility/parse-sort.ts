export function parseSort(sortBy: string | string[], supported: string[]): Array<{ column: string; desc: boolean }> {
  const sorts: Array<{ column: string; desc: boolean }> = [];

  sortBy = Array.isArray(sortBy) ? sortBy : [sortBy];

  const individual = sortBy.flatMap((s: string) => s.split(','));

  for (const singleSort of individual) {
    const [column, order = ''] = singleSort.split(':');
    const col = column.toLowerCase();
    if (supported.includes(col)) {
      sorts.push({ column: col, desc: order.toLowerCase() === 'desc' });
    }
  }

  return sorts;
}
